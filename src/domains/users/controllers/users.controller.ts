import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUserInfoUsecase } from '../usecases/get-user-info.usecase';
import { Network } from '@utils/network';
import { UserDecorator } from '@core/decorators/user.decorator';
import { AuthGuard } from '@core/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';
import { GetUserBalanceUseCase } from '../usecases/get-user-balance.usecase';
import { GetUserOrganizationsUsecase } from '../usecases/get-user-organizations.usecase';
import { User } from '@core/decorators/types';
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserInfoUsecase: GetUserInfoUsecase,
    private readonly getUserBalanceUseCase: GetUserBalanceUseCase,
    private readonly getUserOrganizationsUsecase: GetUserOrganizationsUsecase
  ) {}

  @Get('info')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getUserInfo(@UserDecorator() user: User) {
    return this.getUserInfoUsecase.execute(user.externalId);
  }

  @Get('organizations')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getUserOrganizations(@UserDecorator() user: UserEntity) {
    return this.getUserOrganizationsUsecase.execute(user);
  }

  @Get('/balance')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  async getUserBalance(
    @UserDecorator() user: UserEntity,
    @Query('network') network: 'mainnet' | 'devnet'
  ) {
    return this.getUserBalanceUseCase.execute(
      user.walletAddress,
      Network.get(network ?? 'mainnet')
    );
  }
}
