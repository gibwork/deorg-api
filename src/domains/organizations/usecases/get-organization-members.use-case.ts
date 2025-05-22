import { Inject, Injectable } from '@nestjs/common';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import {
  OrganizationMemberEntity,
  OrganizationRole
} from '@domains/organizations/entities/organization-member.entity';
import { UserService } from '@domains/users/services/user.service';
import { OrganizationMemberService } from '@domains/organizations/services/organization-member.service';
import { OrganizationEntity } from '@domains/organizations/entities/organization.entity';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class GetOrganizationMembersUseCase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly heliusService: HeliusService,
    private readonly userService: UserService,
    private readonly organizationMemberService: OrganizationMemberService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(accountAddress: string): Promise<OrganizationMemberEntity[]> {
    const cachedMembers = await this.cacheManager.get(
      `organization-members-${accountAddress}`
    );
    if (cachedMembers) {
      return cachedMembers as OrganizationMemberEntity[];
    }

    const organization = await this.organizationService.findOne({
      where: { accountAddress },
      relations: {
        members: {
          user: true
        }
      }
    });

    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization =
      await deorg.getOrganizationDetails(accountAddress);

    if (!organization) {
      const members: OrganizationMemberEntity[] = [];

      for (const contributor of onChainOrganization.contributors) {
        const user = await this.userService.findOne({
          where: { walletAddress: contributor }
        });

        if (user) {
          const tempOrg = new OrganizationEntity({
            id: '0',
            accountAddress: accountAddress
          });

          const member = new OrganizationMemberEntity({
            id: '0',
            organizationId: '0',
            userId: user.id,
            role: OrganizationRole.CONTRIBUTOR,
            user,
            organization: tempOrg,
            createdAt: new Date()
          });

          members.push(member);
        }
      }

      return members;
    }

    // First update existing members' roles
    organization.members = organization.members.map((member) => {
      member.role = onChainOrganization.contributors.find(
        (contributor) => contributor === member.user.walletAddress
      )
        ? OrganizationRole.CONTRIBUTOR
        : OrganizationRole.MEMBER;
      return member;
    });

    // Find contributors that are not yet members
    const existingWallets = organization.members.map(
      (member) => member.user.walletAddress
    );

    const newContributors = onChainOrganization.contributors.filter(
      (contributor) => !existingWallets.includes(contributor)
    );

    // Add new contributors as members
    for (const contributor of newContributors) {
      const user = await this.userService.findOne({
        where: { walletAddress: contributor }
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

    const members = organization.members;

    await this.cacheManager.set(
      `organization-members-${accountAddress}`,
      members
    );

    return members;
  }
}
