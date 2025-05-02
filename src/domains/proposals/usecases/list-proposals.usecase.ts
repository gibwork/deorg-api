import { Injectable, NotFoundException } from '@nestjs/common';
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

  async execute(organizationId: string) {
    const organization = await this.organizationService.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const proposals = await this.proposalService.find({
      where: { organizationId }
    });

    const programProposals =
      await this.votingProgramService.getOrganizationProposals(
        organization.accountAddress
      );

    return {
      proposals,
      programProposals
    };
  }
}
