import { OrganizationService } from '@domains/organizations/services/organization.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
@Injectable()
export class GetUserOrganizationsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  async execute(user: UserEntity) {
    const organizations = await this.votingProgramService.getOrganizations();
    const accountAddresses = organizations
      .filter((org) => org.contributors.includes(user.walletAddress))
      .map((org) => org.accountAddress);

    const organizationEntities = await this.organizationService.find({
      where: { accountAddress: In(accountAddresses) } as any,
      relations: {
        members: {
          user: true
        }
      }
    });

    const organizationsEnriched = organizations.map((org) => {
      const entity = organizationEntities.find(
        (e) => e.accountAddress === org.accountAddress
      );

      const members = [
        ...new Set([
          ...(entity?.members.map((m) => m.user.walletAddress) || []),
          ...(org.contributors || [])
        ])
      ];

      return {
        ...org,
        ...entity,
        members
      };
    });

    return organizationsEnriched;
  }
}
