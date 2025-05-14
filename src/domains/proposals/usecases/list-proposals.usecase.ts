import { Injectable } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';

@Injectable()
export class ListProposalsUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  async execute(orgAccountAddress: string) {
    const onChainProposals =
      await this.votingProgramService.getOrganizationProposals(
        orgAccountAddress
      );

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
