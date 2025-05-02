import { ModuleMetadata } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { GetUserBalanceUseCase } from './usecases/get-user-balance.usecase';

export const UsersProvider: ModuleMetadata = {
  providers: [UserService, UserRepository, GetUserBalanceUseCase]
};
