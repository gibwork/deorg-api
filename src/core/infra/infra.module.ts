import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/infra/database/database.module';
import { EncryptModule } from '@core/infra/encrypt/encrypt.module';
import { StorageModule } from '@core/infra/storage/storage.module';
import { CustomCacheModule } from '@core/infra/cache/cache.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SqsModule } from '@ssut/nestjs-sqs';
import { queues } from '@core/infra/sqs/sqs';

@Module({
  imports: [
    SqsModule.register({
      consumers: queues.consumers,
      producers: queues.producers
    }),
    DatabaseModule,
    StorageModule,
    EncryptModule,
    CustomCacheModule,
    PrometheusModule.register()
  ]
})
export class InfraModule {}
