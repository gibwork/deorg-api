import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { TokenService } from '@domains/tokens/services/token.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GetTokenPriceUseCase {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(mintAddress: string) {
    const tokenPrice = await this.tokenService.getPrice(mintAddress);

    if (!tokenPrice) {
      throw new BadRequestException('Unable to get token price');
    }

    await this.cacheManager.set(`price-${mintAddress}`, tokenPrice);

    return {
      price: tokenPrice
    };
  }
}
