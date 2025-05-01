import { HashParams } from '@core/infra/encrypt/jwt/types';
import jwt from 'jsonwebtoken';

export class JWTService {
  hash(params: HashParams) {
    return jwt.sign(params.data, String(process.env.JWT_SECRET), {
      expiresIn: params.expiresIn
    });
  }

  verify<T>(token: string) {
    return jwt.verify(token, String(process.env.PUBLIC_KEY), {
      algorithms: ['RS256']
    }) as T;
  }

  decode<T>(token: string) {
    return jwt.decode(token) as T;
  }
}
