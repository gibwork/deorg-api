import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ListProposalsUsecase } from '../usecases/list-proposals.usecase';
import { ApiTags } from '@nestjs/swagger';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { CreateContributorProposalUsecase } from '../usecases/create-contributor-proposal.usecase';
import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { VoteProposalUsecase } from '../usecases/vote-proposa.usecase';

@Controller('/organizations/:orgAccountAddress/proposals')
@ApiTags('Proposals')
export class ProposalsController {
  constructor(
    private readonly listProposalsUsecase: ListProposalsUsecase,
    private readonly createContributorProposalUsecase: CreateContributorProposalUsecase,
    private readonly voteProposalUsecase: VoteProposalUsecase
  ) {}

  @Get()
  async listProposals(@Param('orgAccountAddress') orgAccountAddress: string) {
    return this.listProposalsUsecase.execute(orgAccountAddress);
  }

  @Post(':proposalAccountAddress/vote')
  async voteProposal(
    @Param('proposalAccountAddress') proposalAccountAddress: string,
    @Param('orgAccountAddress') orgAccountAddress: string,
    @Body() body: VoteProposalDto
  ) {
    return this.voteProposalUsecase.execute(
      proposalAccountAddress,
      orgAccountAddress,
      body
    );
  }

  @Post('/contributor')
  async createContributorProposal(
    @Param('orgAccountAddress') orgAccountAddress: string,
    @Body() body: CreateContributorProposalDto
  ) {
    return this.createContributorProposalUsecase.execute(
      orgAccountAddress,
      body
    );
  }
}
