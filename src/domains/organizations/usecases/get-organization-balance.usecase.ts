import { HeliusService } from '@core/services/helius/helius.service';
import { Deorg } from '@deorg/node';
import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GetOrganizationBalanceUseCase {
  constructor(
    private readonly heliusService: HeliusService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(accountAddress: string, revalidate: boolean = false) {
    if (!revalidate) {
      const cachedBalance = await this.cacheManager.get(
        `organization-balance-${accountAddress}`
      );
      if (cachedBalance) {
        return JSON.parse(cachedBalance as string);
      }
    }

    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization =
      await deorg.getOrganizationDetails(accountAddress);

    const treasuryBalances: any[] = [];

    for (const balance of onChainOrganization.treasuryBalances) {
      const token = await this.heliusService.getDevnetTokenInfo(balance.mint);

      treasuryBalances.push({
        ...balance,
        token
      });
    }

    await this.cacheManager.set(
      `organization-balance-${accountAddress}`,
      treasuryBalances
    );

    return treasuryBalances;
  }
}
