import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async resetCache(): Promise<void> {
    if (this.cacheManager.store?.keys) {
      const keys: string[] = await this.cacheManager.store?.keys('*');

      const keysToDelete = keys.filter((key) => !key.startsWith('price-'));

      for (const key of keysToDelete) {
        await this.cacheManager.del(key);
      }
      return;
    }

    if (this.cacheManager?.reset) await this.cacheManager?.reset();
  }
}
