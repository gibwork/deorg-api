import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetTokenInfoUseCase } from '../usecases/get-token-info.usecase';
import { GetTokenPriceUseCase } from '../usecases/get-token-price.usecase';

@Controller('tokens')
@ApiTags('Tokens')
export class TokensController {
  constructor(
    private readonly getTokenInfoUseCase: GetTokenInfoUseCase,
    private readonly getTokenPriceUseCase: GetTokenPriceUseCase
  ) {}

  @Get(':mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    return this.getTokenInfoUseCase.execute(mintAddress);
  }

  @Get('/price/:mintAddress')
  async getPrice(@Param('mintAddress') mintAddress: string) {
    return this.getTokenPriceUseCase.execute(mintAddress);
  }
}
