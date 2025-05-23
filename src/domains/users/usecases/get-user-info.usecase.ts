import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class GetUserInfoUsecase {
  constructor(private readonly userService: UserService) {}

  async execute(userWalletAddress: string) {
    return this.userService.findOne({
      where: { walletAddress: userWalletAddress }
    });
  }
}
