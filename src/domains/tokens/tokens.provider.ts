import { ModuleMetadata } from '@nestjs/common';
import { TokensController } from './controllers/tokens.controller';
import { GetTokenInfoUseCase } from './usecases/get-token-info.usecase';
import { TokenService } from './services/token.service';
import { GetTokenPriceUseCase } from './usecases/get-token-price.usecase';

export const TokensProvider: ModuleMetadata = {
  controllers: [TokensController],
  providers: [TokenService, GetTokenInfoUseCase, GetTokenPriceUseCase]
};
