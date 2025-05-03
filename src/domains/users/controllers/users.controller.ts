import { Controller, Get, Param } from '@nestjs/common';
import { GetUserInfoUsecase } from '../usecases/get-user-info.usecase';

@Controller('users')
export class UsersController {
  constructor(private readonly getUserInfoUsecase: GetUserInfoUsecase) {}

  @Get(`info`)
  async getUserInfo(@Param('id') id: string) {
    return this.getUserInfoUsecase.execute(id);
  }
}
