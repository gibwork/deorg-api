import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { OrganizationMemberService } from '../services/organization-member.service';
import { UserService } from '@domains/users/services/user.service';
@Injectable()
export class CheckOrganizationMembershipUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly organizationMemberService: OrganizationMemberService
  ) {}

  async execute(accountAddress: string, userWalletAddress: string) {
    const organization = await this.organizationService.findOne({
      where: { accountAddress },
      relations: { members: { user: true } }
    });

    const user = await this.userService.findOne({
      where: { walletAddress: userWalletAddress }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    const isMember = await this.organizationMemberService.findOne({
      where: { organizationId: organization.id, userId: user.id }
    });

    // const userBalance = await this.getUserBalanceUseCase.execute(
    //   user.walletAddress,
    //   'devnet'
    // );

    // const token = userBalance.find(
    //   (balance) => organization.token?.mintAddress === balance.address
    // );

    // if (
    //   !token ||
    //   token.tokenInfo.balance / Math.pow(10, token.tokenInfo.decimals) <
    //     organization.token.amount
    // ) {
    //   return {
    //     allowed: false,
    //     message: 'User does not have the required token amount'
    //   };
    // }

    return {
      allowed: true,
      isMember: !!isMember,
      message: 'User has the required token amount'
    };
  }
}
