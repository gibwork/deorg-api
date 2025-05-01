import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@domains/users/services/user.service';
import { WalletSignIngUseCaseDto } from '../dto/wallet-sign-in.dto';
import { WalletSignature } from '@core/services/wallet-signature/wallet-signature.service';
import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';

@Injectable()
export class SigninUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly walletSignature: WalletSignature,
    private readonly jwtService: JWTService
  ) {}

  async execute(dto: WalletSignIngUseCaseDto): Promise<{ token: string }> {
    const message = `Please sign this message to verify your identity: ${dto.publicKey}`;
    const encodedMessage = new TextEncoder().encode(message);

    const verified = this.walletSignature.verify({
      message: encodedMessage,
      publicKey: dto.publicKey,
      signature: dto.signature
    });

    if (!verified) throw new UnauthorizedException('Invalid signature');

    let user = await this.userService.findOne({
      where: { walletAddress: dto.publicKey }
    });

    if (!user) {
      user = await this.userService.create({
        walletAddress: dto.publicKey,
        username: dto.publicKey.slice(0, 6),
        profilePicture: `https://api.dicebear.com/9.x/thumbs/svg?seed=${Math.random()}`
      });
    }

    const token = this.jwtService.hash({
      data: {
        id: user.id,
        walletAddress: user.walletAddress
      },
      expiresIn: '5d'
    });

    return {
      token
    };
  }
}
