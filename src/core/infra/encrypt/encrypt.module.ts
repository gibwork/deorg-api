import { Module } from '@nestjs/common';
import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';

@Module({
  providers: [JWTService],
})
export class EncryptModule {}
