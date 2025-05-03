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
      (await this.votingProgramService.getOrganizationProposals(
        organization.accountAddress
      )) || [];

    // Create a map of program proposals by their address for quick lookup
    const programProposalsMap = new Map(
      programProposals.map((proposal) => [proposal.proposalAddress, proposal])
    );

    // Merge proposals and programProposals
    const mergedProposals = proposals.map((proposal) => {
      const programProposal = programProposalsMap.get(proposal.accountAddress);
      return {
        ...proposal,
        ...(programProposal && {
          programProposal: {
            proposalAddress: programProposal.proposalAddress,
            organization: programProposal.organization,
            candidate: programProposal.candidate,
            proposer: programProposal.proposer,
            proposedRate: programProposal.proposedRate,
            createdAt: programProposal.createdAt,
            expiresAt: programProposal.expiresAt,
            votesFor: programProposal.votesFor,
            votesAgainst: programProposal.votesAgainst,
            votesTotal: programProposal.votesTotal,
            status: programProposal.status
          }
        })
      };
    });

    // Add any program proposals that don't have a matching database proposal
    const unmatchedProgramProposals = programProposals.filter(
      (programProposal) =>
        !proposals.some(
          (p) => p.accountAddress === programProposal.proposalAddress
        )
    );

    const finalProposals = [
      ...mergedProposals,
      ...unmatchedProgramProposals.map((programProposal) => ({
        proposalAddress: programProposal.proposalAddress,
        organization: programProposal.organization,
        candidate: programProposal.candidate,
        proposer: programProposal.proposer,
        proposedRate: programProposal.proposedRate,
        createdAt: programProposal.createdAt,
        expiresAt: programProposal.expiresAt,
        votesFor: programProposal.votesFor,
        votesAgainst: programProposal.votesAgainst,
        votesTotal: programProposal.votesTotal,
        status: programProposal.status
      }))
    ];

    return finalProposals;
  }
}
