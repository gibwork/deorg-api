import { Injectable } from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/common/cache';
import { isCacheEnabled, redisConfig } from '@core/infra/cache/config';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor() {}

  createCacheOptions(): CacheModuleOptions {
    if (isCacheEnabled) {
      return redisConfig;
    } else {
      return {
        store: {
          create() {
            return {
              get: async () => undefined,
              set: async () => undefined,
              del: async () => undefined
            };
          }
        }
      };
    }
  }
}
