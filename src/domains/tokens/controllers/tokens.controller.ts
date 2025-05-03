import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetTokenInfoUseCase } from '../usecases/get-token-info.usecase';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(private readonly getTokenInfoUseCase: GetTokenInfoUseCase) {}

  @Get(':mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    return this.getTokenInfoUseCase.execute(mintAddress);
  }
}
