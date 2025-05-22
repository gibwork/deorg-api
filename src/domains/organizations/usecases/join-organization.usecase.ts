import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { OrganizationMemberService } from '../services/organization-member.service';
import { UserService } from '@domains/users/services/user.service';
import { OrganizationRole } from '../entities/organization-member.entity';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class JoinOrganizationUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly userService: UserService,
    private readonly heliusService: HeliusService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async execute(accountAddress: string, userId: string) {
    try {
      const deorg = new Deorg({
        rpcUrl: this.heliusService.devnetRpcUrl
      });

      const onChainOrganization =
        await deorg.getOrganizationDetails(accountAddress);

      let organization = await this.organizationService.findOne({
        where: {
          accountAddress
        }
      });

      if (!organization) {
        const token = await this.heliusService.getDevnetTokenInfo(
          onChainOrganization.treasuryBalances[0].mint
        );

        organization = await this.organizationService.create({
          id: onChainOrganization.uuid,
          logoUrl:
            onChainOrganization.metadata.logoUrl ??
            'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd1ZyYWdzb2JOSHJaRDJNMHlYUHpKbW5pWloiLCJyaWQiOiJvcmdfMndvelhpdjRPcmxSMUxNdjN3akw0ZUtSOVEwIiwiaW5pdGlhbHMiOiJZIn0',
          externalId: onChainOrganization.uuid,
          slug: onChainOrganization.name.toLowerCase().replace(/ /g, '-'),
          createdBy: userId,
          token: {
            symbol: token.symbol,
            mintAddress: token.address,
            amount: 0,
            imageUrl: token.logoURI
          },
          accountAddress,
          members: []
        });
      }

      const organizationMember = await this.organizationMemberService.findOne({
        where: {
          organizationId: organization.id,
          userId
        }
      });

      if (organizationMember) {
        throw new BadRequestException('User already joined organization');
      }

      const user = await this.userService.findOne({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const member = await this.organizationMemberService.create({
        organizationId: organization.id,
        userId,
        role: OrganizationRole.MEMBER
      });

      await this.cacheManager.del(`organization-${accountAddress}`);
      await this.cacheManager.del('organizations');

      return member;
    } catch (e) {
      console.log(e.message);
      throw new Error(e);
    }
  }
}
