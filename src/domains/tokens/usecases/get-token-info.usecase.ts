import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { TokenService } from '@domains/tokens/services/token.service';
import { isValidSolanaAddress } from '@utils/is-valid-solana-address';

@Injectable()
export class GetTokenInfoUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(mintAddress: string) {
    const isValidToken = isValidSolanaAddress(mintAddress);
    if (!isValidToken) throw new BadRequestException('Invalid token address');

    const token = await this.tokenService.getInfo(mintAddress);

    if (!token) throw new NotFoundException('Token not found');

    if (token.symbol.toLowerCase() == 'dean') {
      token.logoURI = 'https://media.gib.work/token-icons/logo_dl.png';
    }

    return token;
  }
}
