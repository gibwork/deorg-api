import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Network } from '@utils/network';
import { GetUserBalanceUseCase } from '@domains/users/usecases/get-user-balance.usecase';

@Injectable()
export class CheckOrganizationMembershipUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly getUserBalanceUseCase: GetUserBalanceUseCase
  ) {}

  async execute(organizationId: string, user: UserEntity) {
    const organization = await this.organizationService.findOne({
      where: { id: organizationId },
      relations: { members: true }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const userBalance = await this.getUserBalanceUseCase.execute(
      user.walletAddress,
      Network.get('mainnet')
    );

    const token = userBalance.find(
      (balance) => organization.token?.mintAddress === balance.address
    );

    if (
      !token ||
      token.tokenInfo.balance / Math.pow(10, token.tokenInfo.decimals) <
        organization.token.amount
    ) {
      return {
        allowed: false,
        message: 'User does not have the required token amount'
      };
    }

    return {
      allowed: true,
      message: 'User has the required token amount'
    };
  }
}
