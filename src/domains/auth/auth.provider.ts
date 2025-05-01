import { ModuleMetadata } from '@nestjs/common';
import { AuthController } from '@domains/auth/controllers/auth.controller';
import { SigninUseCase } from '@domains/auth/usecases/signin.usecase';

export const AuthProvider: ModuleMetadata = {
  controllers: [AuthController],
  providers: [SigninUseCase]
};
