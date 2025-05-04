import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';

@Injectable()
export class ListOrganizationsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  async execute() {
    const organizations = await this.votingProgramService.getOrganizations();

    const organizationsEnriched: any[] = [];

    for (const organization of organizations) {
      const organizationEntity = await this.organizationService.findOne({
        where: { accountAddress: organization.accountAddress },
        relations: {
          members: {
            user: true
          }
        }
      });

      organizationsEnriched.push({
        ...organization,
        ...organizationEntity,
        members: organizationEntity ? organizationEntity.members : []
      });
    }

    return organizationsEnriched;
  }
}
