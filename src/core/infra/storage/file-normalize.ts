import { IFile, IFileNormalize } from '@core/infra/storage/types';
import mimeTypes from 'mime-types';
import slugify from 'slugify';
import { randomUUID } from 'node:crypto';

export class FileNormalize implements IFileNormalize {
  extractAttributeFile(file: Express.Multer.File): IFile | null {
    const extension = mimeTypes.extension(file.mimetype) as string;
    if (!extension) {
      return null;
    }

    const fileNameWithoutExtension = this.removeExtensionFileName(
      file.originalname
    );

    const sanitizedFileName = this.sanitizeFileName(fileNameWithoutExtension);
    if (!sanitizedFileName) {
      return null;
    }

    const attribute = {
      contentType: file.mimetype,
      fileName: sanitizedFileName,
      fileExtension: extension
    };

    return attribute;
  }

  generateFileKey(attribute: IFile, generateKey?: boolean): string {
    const prefix = this.generateFilePrefix();
    if (generateKey === false) {
      return `.${attribute.fileExtension}`;
    }

    const uuid = randomUUID();
    return `${prefix}-${uuid}.${attribute.fileExtension}`;
  }

  private generateFilePrefix(): string {
    const prefix = new Date().getTime().toString();
    return prefix;
  }

  private removeExtensionFileName(fileName: string): string {
    const removeExtensionFileName = /\.[^.]*$/;
    const fileNameWithoutExtension = fileName.replace(
      removeExtensionFileName,
      ''
    );
    return fileNameWithoutExtension;
  }

  sanitizeFileName(fileName: string): string {
    const fileNameConvertedToUTF8 = Buffer.from(fileName, 'latin1').toString(
      'utf8'
    );
    const sanitizedFileName = slugify(fileNameConvertedToUTF8, {
      replacement: '_',
      lower: true,
      strict: false,
      trim: true
    });

    return sanitizedFileName;
  }
}
