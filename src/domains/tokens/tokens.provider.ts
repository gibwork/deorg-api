import { ModuleMetadata } from '@nestjs/common';
import { TokensController } from './controllers/tokens.controller';
import { GetTokenInfoUseCase } from './usecases/get-token-info.usecase';
import { TokenService } from './services/token.service';

export const TokensProvider: ModuleMetadata = {
  controllers: [TokensController],
  providers: [TokenService, GetTokenInfoUseCase]
};
