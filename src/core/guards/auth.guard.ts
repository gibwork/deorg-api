import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';
import { ClerkService } from '@core/services/clerk/clerk.service';
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
    private readonly userService: UserService,
    private readonly clerkService: ClerkService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization']?.split('Bearer ')[1];

    if (token === 'null') token = null;

    try {
      const decoded = this.jwtService.verify<{
        sub: string;
        role: string;
      }>(token);

      let user = await this.userService.findOne({
        where: { externalId: decoded.sub }
      });

      if (user) {
        request.user = user;
        return true;
      }

      const clerkUser = await this.clerkService.getUser(decoded.sub);

      if (!clerkUser) {
        throw new UnauthorizedException();
      }

      user = await this.userService.create({
        externalId: decoded.sub,
        walletAddress: clerkUser.private_metadata.publicKey,
        username: clerkUser.username,
        profilePicture: clerkUser.image_url
      });

      return true;
    } catch (e) {
      Logger.error(e.message, 'AuthGuard');
      throw new UnauthorizedException();
    }
  }
}
