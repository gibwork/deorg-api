import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { OrganizationMemberService } from '../services/organization-member.service';
import { UserService } from '@domains/users/services/user.service';
import { GetUserBalanceUseCase } from '@domains/users/usecases/get-user-balance.usecase';
import { OrganizationRole } from '../entities/organization-member.entity';
import { ClerkService } from '@core/services/clerk/clerk.service';

@Injectable()
export class JoinOrganizationUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly userService: UserService,
    private readonly getUserBalanceUseCase: GetUserBalanceUseCase,
    private readonly clerkService: ClerkService
  ) {}

  async execute(organizationId: string, userId: string) {
    const organization = await this.organizationService.findOne({
      where: {
        id: organizationId
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    console.log({
      organizationId,
      userId
    });

    const organizationMember = await this.organizationMemberService.findOne({
      where: {
        organizationId,
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

    const userBalance = await this.getUserBalanceUseCase.execute(
      user.walletAddress,
      'devenet',
      true
    );

    const token = userBalance.find(
      (balance) => organization.token?.mintAddress === balance.address
    );

    if (
      !token ||
      token.tokenInfo.balance / Math.pow(10, token.tokenInfo.decimals) <
        organization.token.amount
    ) {
      throw new BadRequestException(
        'User does not have the required token amount'
      );
    }

    const member = await this.organizationMemberService.create({
      organizationId,
      userId,
      role: OrganizationRole.MEMBER
    });

    const clerkRole = this.organizationService.getClerkRole(
      OrganizationRole.MEMBER
    );
    await this.clerkService.addMemberToOrganization(
      organization.externalId,
      user.externalId,
      clerkRole
    );

    return member;
  }
}
