import {
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { HeliusService } from '@core/services/helius/helius.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { isValidSolanaAddress } from '@utils/is-valid-solana-address';
import { DiscordService } from '@core/services/discord/discord.service';

@Injectable()
export class GetUserBalanceUseCase {
  constructor(
    private readonly heliusService: HeliusService,
    private readonly discordService: DiscordService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(
    wallet: string,
    network: string,
    revalidate: boolean = false
  ): Promise<Array<TokenPayload>> {
    const isValidAddres = isValidSolanaAddress(wallet);
    if (!isValidAddres) return [];

    if (!revalidate) {
      const userBalanceCache = await this.cacheManager.get<Array<TokenPayload>>(
        `user-balance-${wallet}-${network}`
      );
      if (userBalanceCache) {
        return userBalanceCache;
      }
    }

    try {
      const balance = await this.heliusService.getBalance({
        publicKey: wallet,
        network
      });

      await this.cacheManager.set(
        `user-balance-${wallet}-${network}`,
        balance,
        {
          ttl: 120
        }
      );

      return balance;
    } catch (e) {
      if (e.message === 'Rate limit exceeded') {
        const userBalanceCache = await this.cacheManager.get<
          Array<TokenPayload>
        >(`user-balance-${wallet}-${network}`);
        if (userBalanceCache) {
          await this.discordService.sendMessage(
            `helius ${e.message} returning cache.`
          );

          return userBalanceCache;
        }
      }

      await this.discordService.sendMessage(
        `helius ${e.message} and no cache found.`
      );

      throw new InternalServerErrorException('Unable to fetch tokens.');
    }
  }
}

interface PriceInfo {
  price_per_token: number;
  total_price: number;
  currency: string;
}

interface TokenInfo {
  balance: number;
  supply: number;
  decimals: number;
  token_program: string;
  associated_token_address: string;
  price_info: PriceInfo;
}

export interface TokenPayload {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  tokenInfo: TokenInfo;
}
