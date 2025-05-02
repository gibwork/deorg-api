import { Controller, Body, Post, HttpCode } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SigninUseCase } from '@domains/auth/usecases/signin.usecase';
import { WalletSignIngUseCaseDto } from '../dto/wallet-sign-in.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly signinUseCase: SigninUseCase) {}

  @Post('/wallet-signin')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Sign in successfully',
    example: {
      token: 'TOKEN_EXAMPLE'
    }
  })
  async signIn(
    @Body() dto: WalletSignIngUseCaseDto
  ): Promise<{ token: string }> {
    return this.signinUseCase.execute(dto);
  }
}
