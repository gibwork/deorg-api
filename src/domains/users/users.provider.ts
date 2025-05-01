import { ModuleMetadata } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';

export const UsersProvider: ModuleMetadata = {
  providers: [UserService, UserRepository]
};
