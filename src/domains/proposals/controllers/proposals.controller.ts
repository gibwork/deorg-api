import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ListProposalsUsecase } from '../usecases/list-proposals.usecase';
import { ApiTags } from '@nestjs/swagger';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { CreateContributorProposalUsecase } from '../usecases/create-contributor-proposal.usecase';
@Controller('/organizations/:organizationId/proposals')
@ApiTags('Proposals')
export class ProposalsController {
  constructor(
    private readonly listProposalsUsecase: ListProposalsUsecase,
    private readonly createContributorProposalUsecase: CreateContributorProposalUsecase
  ) {}

  @Get()
  async listProposals(@Param('organizationId') organizationId: string) {
    return this.listProposalsUsecase.execute(organizationId);
  }

  @Post('/contributor')
  async createContributorProposal(
    @Param('organizationId') organizationId: string,
    @Body() body: CreateContributorProposalDto
  ) {
    return this.createContributorProposalUsecase.execute(organizationId, body);
  }
}
