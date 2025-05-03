import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import {
  OrganizationMemberEntity,
  OrganizationRole
} from '@domains/organizations/entities/organization-member.entity';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { UserService } from '@domains/users/services/user.service';
import { OrganizationMemberService } from '@domains/organizations/services/organization-member.service';
@Injectable()
export class GetOrganizationMembersUseCase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService,
    private readonly userService: UserService,
    private readonly organizationMemberService: OrganizationMemberService
  ) {}

  async execute(organizationId: string): Promise<OrganizationMemberEntity[]> {
    const organization = await this.organizationService.findOne({
      where: { id: organizationId },
      relations: {
        members: {
          user: true
        }
      }
    });

    if (!organization) throw new NotFoundException('Organization not found');

    if (organization.accountAddress) {
      const contributors =
        await this.votingProgramService.getOrganizationContributors(
          organization.accountAddress
        );

      // First update existing members' roles
      organization.members = organization.members.map((member) => {
        member.role = contributors.find(
          (contributor) => contributor.toBase58() === member.user.walletAddress
        )
          ? OrganizationRole.CONTRIBUTOR
          : OrganizationRole.MEMBER;
        return member;
      });

      // Find contributors that are not yet members
      const existingWallets = organization.members.map(
        (member) => member.user.walletAddress
      );

      const newContributors = contributors.filter(
        (contributor) => !existingWallets.includes(contributor.toBase58())
      );

      // Add new contributors as members
      for (const contributor of newContributors) {
        const user = await this.userService.findOne({
          where: { walletAddress: contributor.toBase58() }
        });

        if (user) {
          await this.organizationMemberService.create({
            organizationId: organization.id,
            userId: user.id,
            role: OrganizationRole.MEMBER
          });

          const member = await this.organizationMemberService.findOne({
            where: {
              organizationId: organization.id,
              userId: user.id
            },
            relations: {
              user: true
            }
          });

          if (member) {
            organization.members.push(member);
          }
        }
      }
    }

    return organization.members;
  }
}
