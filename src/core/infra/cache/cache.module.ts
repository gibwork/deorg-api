import { Global, Logger, Module } from '@nestjs/common';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from '@core/infra/cache/CacheConfigService';
import cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientType } from 'redis';
import { redisConfig } from '@core/infra/cache/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService
    })
  ],
  providers: [
    CacheConfigService,
    {
      provide: CACHE_MANAGER,
      useFactory: async (cacheConfigService: CacheConfigService) => {
        const cacheOptions: any = cacheConfigService.createCacheOptions();
        if (cacheOptions.enable) {
          cacheOptions.store = redisStore;
          const redisCache = cacheManager.caching(cacheOptions);

          const redisClient = (
            redisCache.store as any
          ).getClient() as RedisClientType;

          redisClient.on('ready', () => {
            Logger.debug(
              { message: { status: 'REDIS is ready', envs: redisConfig } },
              'Redis'
            );
          });
          redisClient.on('error', (error) => {
            Logger.debug(redisConfig, 'Redis envs');
            if (redisConfig.enable) {
              Logger.error({ message: error }, 'Redis');
              throw error;
            }
            Logger.warn({ message: error }, 'Redis');
          });

          return redisCache;
        }

        return cacheOptions.store.create();
      },
      inject: [CacheConfigService]
    }
  ],
  exports: [CACHE_MANAGER]
})
export class CustomCacheModule {}
