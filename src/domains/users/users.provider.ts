import { ModuleMetadata } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { GetUserBalanceUseCase } from './usecases/get-user-balance.usecase';
import { GetUserInfoUsecase } from './usecases/get-user-info.usecase';
import { UsersController } from './controllers/users.controller';

export const UsersProvider: ModuleMetadata = {
  controllers: [UsersController],
  providers: [
    UserService,
    UserRepository,
    GetUserBalanceUseCase,
    GetUserInfoUsecase
  ]
};
