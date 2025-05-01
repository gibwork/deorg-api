import {
  IStorageService,
  IStorageServiceResultTempLink,
  IStorageServiceResultUpload,
  IUploadFile
} from '@core/infra/storage/types';
import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { FileNormalize } from '@core/infra/storage/file-normalize';
import { cwd, env } from 'process';
import { mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class FilesystemStorage implements IStorageService {
  private readonly initialPath: string;

  constructor(private fileUtil: FileNormalize) {
    this.initialPath = env.STORAGE_FILESYSTEM_BASE_PATH || 'storage';
  }

  getTempLink(path: string): Promise<IStorageServiceResultTempLink> {
    return Promise.resolve({
      tempLink: path,
      expiresOn: ''
    });
  }

  upload({
    file,
    filePath
  }: IUploadFile): Promise<IStorageServiceResultUpload> {
    const attribute = this.fileUtil.extractAttributeFile(file);
    if (!attribute) {
      Logger.error(
        'upload: unable to extract file attributes',
        'FilesystemStorage'
      );
      throw new Error('Unable to extract file attributes');
    }

    const generatedFileKey = this.fileUtil.generateFileKey(attribute);

    const finalPath = this.generatePathToSaveFile(
      `${this.initialPath}/${filePath}/${generatedFileKey}`
    );

    const resultFile = this.saveFileInFileSystem({
      path: `${this.initialPath}/${filePath}`,
      fileName: generatedFileKey,
      fileBuffer: file.buffer
    });

    if (!resultFile) {
      Logger.error(
        'upload: unable to save file in filesystem',
        'FilesystemStorage'
      );
      throw new Error('Unable to save file in filesystem');
    }

    const result: IStorageServiceResultUpload = {
      fileName: generatedFileKey,
      mimetype: attribute.contentType,
      path: finalPath
    };

    return Promise.resolve(result);
  }

  private saveFileInFileSystem({
    path,
    fileName,
    fileBuffer
  }: {
    path: string;
    fileName: string;
    fileBuffer: Buffer;
  }): boolean {
    try {
      writeFileSync(`${path}/${fileName}`, fileBuffer);
      return true;
    } catch (error) {
      Logger.error('fileSystemStorage > saveFileInFileSystem', error);
      return false;
    }
  }

  private generatePathToSaveFile(path: string): string {
    try {
      const basePath = cwd();
      const splitedPaths = `${basePath}/${path}`.split('/');
      const finalPathWithoutFileName = splitedPaths
        .slice(0, splitedPaths.length - 1)
        .join('/');

      mkdirSync(finalPathWithoutFileName, { recursive: true });

      return finalPathWithoutFileName;
    } catch (error) {
      Logger.error('fileSystemStorage > generatePathToSaveFile', error);
      throw new InternalServerErrorException(
        'Unable to save file in filesystem'
      );
    }
  }
}
