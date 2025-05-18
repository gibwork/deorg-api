import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { isValidSolanaAddress } from '@utils/is-valid-solana-address';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class GetTokenInfoUseCase {
  constructor(private readonly heliusService: HeliusService) {}

  async execute(mintAddress: string) {
    const isValidToken = isValidSolanaAddress(mintAddress);
    if (!isValidToken) throw new BadRequestException('Invalid token address');

    const token = await this.heliusService.getDevnetTokenInfo(mintAddress);

    if (!token) throw new NotFoundException('Token not found');

    if (token.symbol.toLowerCase() == 'dean') {
      token.logoURI = 'https://media.gib.work/token-icons/logo_dl.png';
    }

    return token;
  }
}
