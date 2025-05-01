import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';
import { UserService } from '@domains/users/services/user.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JWTService,
    private readonly userService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization']?.split('Bearer ')[1];

    if (token === 'null') token = null;

    try {
      const decoded = this.jwtService.verify<{
        id: string;
        walletAddress: string;
      }>(token);

      let user = await this.userService.findOne({
        where: { walletAddress: decoded.walletAddress }
      });

      if (!user) {
        user = await this.userService.create({
          walletAddress: decoded.walletAddress,
          username: decoded.walletAddress.slice(0, 6),
          profilePicture: `https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.random()}`
        });
      }

      request.user = user;

      return true;
    } catch (e) {
      Logger.error(e.message, 'AuthGuard');
      throw new UnauthorizedException();
    }
  }
}
