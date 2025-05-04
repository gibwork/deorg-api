import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
@Injectable()
export class GetOrganizationDetailsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  async execute(accountAddress: string) {
    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(accountAddress);

    const organization = await this.organizationService.findOne({
      where: {
        accountAddress
      },
      relations: {
        members: {
          user: true
        }
      }
    });

    return { ...onChainOrganization, ...organization };
  }
}
