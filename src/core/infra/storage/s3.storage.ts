import AWS, { S3 } from 'aws-sdk';
import {
  IStorageService,
  IStorageServiceResultTempLink,
  IStorageServiceResultUpload,
  IUploadFile
} from '@core/infra/storage/types';
import { Injectable, Logger } from '@nestjs/common';
import { FileNormalize } from '@core/infra/storage/file-normalize';
import process from 'node:process';

@Injectable()
export class S3Storage implements IStorageService {
  private s3: AWS.S3;

  constructor(private fileUtil: FileNormalize) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION
    });
  }

  async getTempLink(path: string): Promise<IStorageServiceResultTempLink> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path,
      Expires: 60 * 60
    };

    const tempLink = await this.s3.getSignedUrlPromise('getObject', params);

    return {
      tempLink,
      expiresOn: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString()
    };
  }

  async upload({
    file,
    filePath,
    generateKey = true,
    cdn = true
  }: IUploadFile): Promise<IStorageServiceResultUpload> {
    const attribute = this.fileUtil.extractAttributeFile(file);
    if (!attribute) {
      Logger.error('upload: unable to extract file attributes', 'S3Storage');
      throw new Error('Unable to extract file attributes');
    }

    const generatedFileKey = this.fileUtil.generateFileKey(
      attribute,
      generateKey
    );

    let key = `${filePath}/${generatedFileKey}`;

    if (generateKey === false) {
      key = `${filePath}${generatedFileKey}`;
    }

    const params: S3.Types.PutObjectRequest = {
      Bucket: String(process.env.AWS_BUCKET_NAME),
      Key: key,
      Body: file.buffer,
      ContentType: attribute.contentType
    };

    try {
      const s3img = await this.s3.upload(params).promise();

      let path = s3img.Location;

      if (cdn) {
        path = this.replaceCdnUrl(path);
      }

      return {
        fileName: generatedFileKey,
        mimetype: attribute.contentType,
        path
      };
    } catch (error) {
      Logger.error('upload: unable to upload file to S3', 'S3Storage');
      throw new Error('Unable to upload file to S3');
    }
  }

  async checkIfImageExists(key: string): Promise<boolean> {
    const params = {
      Bucket: String(process.env.AWS_BUCKET_NAME),
      Key: key
    };

    try {
      await this.s3.headObject(params).promise();
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  private replaceCdnUrl(url: string): string {
    return url.replace(
      /https:\/\/deorg-(dev|prod)\.s3\.amazonaws\.com/,
      process.env.CDN_IMAGES!
    );
  }
}
