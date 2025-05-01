import { Module } from '@nestjs/common';
import { FilesystemStorage } from '@core/infra/storage/filesystem.storage';
import { FileNormalize } from '@core/infra/storage/file-normalize';
import { STORAGE_SERVICE } from '@core/infra/storage/types';

@Module({
  providers: [
    FileNormalize,
    {
      provide: STORAGE_SERVICE,
      useClass: FilesystemStorage
    }
  ]
})
export class StorageModule {}
