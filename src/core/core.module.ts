import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';
import { StorageModule } from '@core/infra/storage/storage.module';
import { FilesystemStorage } from '@core/infra/storage/filesystem.storage';
import { FileNormalize } from '@core/infra/storage/file-normalize';
import {
  STORAGE_SERVICE_ENV,
  STORAGE_SERVICE_LOCAL
} from '@core/infra/storage/types';
import { S3Storage } from '@core/infra/storage/s3.storage';
import { XcrowService } from '@core/services/xcrow/xcrow.service';
import { HealthController } from '@core/controllers/health.controller';
import { ClerkService } from '@core/services/clerk/clerk.service';
import { GithubService } from './services/github/github.service';
import { DiscordService } from '@core/services/discord/discord.service';
import { EventSQS } from '@core/services/sqs/sqs.service';
import { DecafService } from '@core/services/decaf/decaf.service';
import { CacheService } from '@core/services/cache/cache.service';
import { WalletSignature } from '@core/services/wallet-signature/wallet-signature.service';
import { HeliusService } from '@core/services/helius/helius.service';
import { TeleswapService } from '@core/services/teleswap/teleswap.service';
import { TransactionBuilderService } from '@core/services/solana/transaction-builder.service';

const providers = [
  JWTService,
  StorageModule,
  FileNormalize,
  XcrowService,
  DecafService,
  WalletSignature,
  GithubService,
  ClerkService,
  DiscordService,
  CacheService,
  EventSQS,
  HeliusService,
  TeleswapService,
  TransactionBuilderService,
  {
    provide: STORAGE_SERVICE_LOCAL,
    useClass: FilesystemStorage
  },
  {
    provide: STORAGE_SERVICE_ENV,
    useClass: S3Storage
  }
];

@Module({
  controllers: [HealthController],
  imports: [InfraModule],
  providers: providers,
  exports: providers
})
export class CoreModule {}
