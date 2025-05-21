import { Injectable } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';
@Injectable()
export class ListProposalsUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(orgAccountAddress: string) {
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

    return proposals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
