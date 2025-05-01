import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization']?.split('Bearer ')[1];

    if (token === 'null') token = null;

    try {
      return true;
    } catch (e) {
      Logger.error(e.message, 'AuthGuard');
      throw new UnauthorizedException();
    }
  }
}
