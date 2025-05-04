import { Injectable, NotFoundException } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { OrganizationService } from '@domains/organizations/services/organization.service';

@Injectable()
export class ListProjectsUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly organizationService: OrganizationService
  ) {}

  async execute(organizationId: string) {
    const organization = await this.organizationService.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.votingProgramService.getOrganizationProjects(
      organization.accountAddress!
    );
  }
}
