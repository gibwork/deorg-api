import { Inject, Injectable } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class ListProposalsUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly heliusService: HeliusService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(orgAccountAddress: string) {
    const cachedProposals = await this.cacheManager.get(
      `proposals-${orgAccountAddress}`
    );
    if (cachedProposals) {
      return cachedProposals;
    }

    const dorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainProposals =
      await dorg.getOrganizationProposals(orgAccountAddress);

    const proposals: any[] = [];

    for (const proposal of onChainProposals) {
      const p = await this.proposalService.findOne({
        where: { accountAddress: proposal.proposalAddress }
      });

      proposals.push({
        ...p,
        ...proposal
      });
    }

    const sortedProposals = proposals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    await this.cacheManager.set(
      `proposals-${orgAccountAddress}`,
      sortedProposals
    );

    return sortedProposals;
  }
}
