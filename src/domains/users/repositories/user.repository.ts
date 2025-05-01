import { Repository } from '@core/repositories/repository';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor() {
    super(UserEntity);
  }

  getEntity(parameters: Partial<UserEntity>): UserEntity {
    return new UserEntity(parameters);
  }
}
