import { OrganizationService } from '@domains/organizations/services/organization.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';

@Injectable()
export class GetUserOrganizationsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  async execute(user: UserEntity) {
    // Get all organizations from voting program
    const organizationsOnProgram =
      await this.votingProgramService.getOrganizations();

    // Get all organizations from DB
    const dbOrgs = await this.organizationService.find({
      relations: ['members', 'members.user']
    });

    // Filter organizations where user is either a contributor or member
    const userOrgs = organizationsOnProgram.filter((org) => {
      const isContributor = org.contributors.includes(user.walletAddress);
      const dbOrg = dbOrgs.find((e) => e.accountAddress === org.accountAddress);
      const isMember = dbOrg?.members.some(
        (m) => m.user.walletAddress === user.walletAddress
      );

      return isContributor || isMember;
    });

    // Enrich the organizations with DB data
    return userOrgs.map((org) => {
      const dbOrg = dbOrgs.find((e) => e.accountAddress === org.accountAddress);

      const members = [
        ...new Set([
          ...(dbOrg?.members.map((m) => m.user.walletAddress) || []),
          ...(org.contributors || [])
        ])
      ];

      return {
        ...org,
        ...dbOrg,
        members
      };
    });
  }
}
