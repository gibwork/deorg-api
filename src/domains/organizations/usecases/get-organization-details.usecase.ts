import { Inject, Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { HeliusService } from '@core/services/helius/helius.service';
import { Deorg } from '@deorg/node';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GetOrganizationDetailsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly heliusService: HeliusService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(accountAddress: string) {
    const cachedOrganization = await this.cacheManager.get(
      `organization-${accountAddress}`
    );
    if (cachedOrganization) {
      return cachedOrganization;
    }

    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization =
      await deorg.getOrganizationDetails(accountAddress);

    const organization = await this.organizationService.findOne({
      where: {
        accountAddress
      },
      relations: {
        members: {
          user: true
        }
      }
    });

    const treasuryBalances: any[] = [];

    for (const balance of onChainOrganization.treasuryBalances) {
      const token = await this.heliusService.getDevnetTokenInfo(balance.mint);

      treasuryBalances.push({
        ...balance,
        token
      });
    }

    onChainOrganization.treasuryBalances = treasuryBalances;

    const organizationDetails = { ...onChainOrganization, ...organization };

    await this.cacheManager.set(
      `organization-${accountAddress}`,
      organizationDetails
    );

    return organizationDetails;
  }
}
