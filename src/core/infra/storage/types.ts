export const STORAGE_SERVICE_ENV = 'StorageService';
export const STORAGE_SERVICE_LOCAL = 'StorageServiceLocal';

export const STORAGE_SERVICE = STORAGE_SERVICE_ENV;

export interface IUploadFile {
  filePath: string;
  file: Express.Multer.File;
  generateKey?: boolean;
  cdn?: boolean;
}

export interface IStorageService {
  upload(params: IUploadFile): Promise<IStorageServiceResultUpload>;
  getTempLink(path: string): Promise<IStorageServiceResultTempLink>;
}

export type IStorageServiceResultUpload = {
  fileName: string;
  mimetype: string;
  path: string;
  publicLink?: string;
  linkExpiresOn?: string;
};

export interface IStorageServiceResultTempLink {
  tempLink: string;
  expiresOn: string;
}

export interface IFile {
  contentType: string;
  fileName: string;
  fileExtension: string;
}

export interface IFileNormalize {
  extractAttributeFile(file: Express.Multer.File): IFile | null;
  generateFileKey(attribute: IFile): string;
}
