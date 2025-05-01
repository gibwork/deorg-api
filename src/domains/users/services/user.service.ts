import { UserEntity } from '@domains/users/entities/user.entity';
import { Service } from '@core/services/data/service';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domains/users/repositories/user.repository';

@Injectable()
export class UserService extends Service<UserEntity> {
  constructor(private readonly userRepository: UserRepository) {
    super({ repository: userRepository, entityName: 'user' });
  }
}
