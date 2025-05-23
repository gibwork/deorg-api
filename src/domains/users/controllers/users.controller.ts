import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetUserInfoUsecase } from '../usecases/get-user-info.usecase';
import { Network } from '@utils/network';
import { AuthGuard } from '@core/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUserBalanceUseCase } from '../usecases/get-user-balance.usecase';
import { GetUserOrganizationsUsecase } from '../usecases/get-user-organizations.usecase';
import { GetUserTasksUsecase } from '../usecases/get-user-tasks.usecase';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserInfoUsecase: GetUserInfoUsecase,
    private readonly getUserBalanceUseCase: GetUserBalanceUseCase,
    private readonly getUserOrganizationsUsecase: GetUserOrganizationsUsecase,
    private readonly getUserTasksUsecase: GetUserTasksUsecase
  ) {}

  @Get('info/:userWalletAddress')
  @ApiBearerAuth('access-token')
  async getUserInfo(@Param('userWalletAddress') userWalletAddress: string) {
    return this.getUserInfoUsecase.execute(userWalletAddress);
  }

  @Get('organizations/:userWalletAddress')
  @ApiBearerAuth('access-token')
  async getUserOrganizations(
    @Param('userWalletAddress') userWalletAddress: string
  ) {
    return this.getUserOrganizationsUsecase.execute(userWalletAddress);
  }

  @Get('/balance/:userWalletAddress')
  @ApiBearerAuth('access-token')
  async getUserBalance(
    @Param('userWalletAddress') userWalletAddress: string,
    @Query('network') network: 'mainnet' | 'devnet'
  ) {
    return this.getUserBalanceUseCase.execute(
      userWalletAddress,
      'devnet' // Network.get(network ?? 'mainnet')
    );
  }

  @Get('/tasks/:userWalletAddress')
  @ApiBearerAuth('access-token')
  async getUserTasks(@Param('userWalletAddress') userWalletAddress: string) {
    return this.getUserTasksUsecase.execute(userWalletAddress);
  }
}
