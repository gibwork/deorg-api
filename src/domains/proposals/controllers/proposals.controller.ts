import { Controller, Get, Param } from '@nestjs/common';
import { ListProposalsUsecase } from '../usecases/list-proposals.usecase';

@Controller('/organizations/:organizationId/proposals')
export class ProposalsController {
  constructor(private readonly listProposalsUsecase: ListProposalsUsecase) {}

  @Get()
  async listProposals(@Param('organizationId') organizationId: string) {
    return this.listProposalsUsecase.execute(organizationId);
  }
}
