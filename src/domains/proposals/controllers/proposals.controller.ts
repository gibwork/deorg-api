import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ListProposalsUsecase } from '../usecases/list-proposals.usecase';
import { ApiTags } from '@nestjs/swagger';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { CreateContributorProposalUsecase } from '../usecases/create-contributor-proposal.usecase';
import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { VoteProposalUsecase } from '../usecases/vote-proposa.usecase';

@Controller('/organizations/:organizationId/proposals')
@ApiTags('Proposals')
export class ProposalsController {
  constructor(
    private readonly listProposalsUsecase: ListProposalsUsecase,
    private readonly createContributorProposalUsecase: CreateContributorProposalUsecase,
    private readonly voteProposalUsecase: VoteProposalUsecase
  ) {}

  @Get()
  async listProposals(@Param('organizationId') organizationId: string) {
    return this.listProposalsUsecase.execute(organizationId);
  }

  @Post(':proposalId/vote')
  async voteProposal(
    @Param('proposalId') proposalId: string,
    @Body() body: VoteProposalDto
  ) {
    return this.voteProposalUsecase.execute(proposalId, body);
  }

  @Post('/contributor')
  async createContributorProposal(
    @Param('organizationId') organizationId: string,
    @Body() body: CreateContributorProposalDto
  ) {
    return this.createContributorProposalUsecase.execute(organizationId, body);
  }
}
