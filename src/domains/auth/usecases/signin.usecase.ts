import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@domains/users/services/user.service';
import { WalletSignIngUseCaseDto } from '../dto/wallet-sign-in.dto';
import { WalletSignature } from '@core/services/wallet-signature/wallet-signature.service';
import { JWTService } from '@core/infra/encrypt/jwt/jwt.service';
import { ClerkService } from '@core/services/clerk/clerk.service';

@Injectable()
export class SigninUseCase {
  constructor(
    private readonly userService: UserService,
    private readonly walletSignature: WalletSignature,
    private readonly jwtService: JWTService,
    private readonly clerkService: ClerkService
  ) {}

  async execute(dto: WalletSignIngUseCaseDto): Promise<{ token: string }> {
    const message = `Please sign this message to verify your identity: ${dto.publicKey}`;
    const encodedMessage = new TextEncoder().encode(message);

    // const verified = this.walletSignature.verify({
    //   message: encodedMessage,
    //   publicKey: dto.publicKey,
    //   signature: dto.signature
    // });

    // if (!verified) throw new UnauthorizedException('Invalid signature');

    const user = await this.userService.findOne({
      where: { walletAddress: dto.publicKey }
    });

    if (user) {
      const signInToken = await this.clerkService.getSignInToken(
        user?.externalId
      );

      return signInToken;
    }

    const existingUser = await this.clerkService.findUserByUsername(
      dto.publicKey.slice(0, 6).toLowerCase()
    );

    if (existingUser) {
      const signInToken = await this.clerkService.getSignInToken(
        existingUser.id
      );

      await this.userService.create({
        externalId: existingUser.id,
        walletAddress: dto.publicKey,
        username: existingUser.username!,
        profilePicture: existingUser.image_url
      });

      return signInToken;
    }

    const newUser = await this.clerkService.createUser(
      dto.publicKey.toLowerCase()
    );

    await this.userService.create({
      externalId: newUser.id,
      walletAddress: dto.publicKey,
      username: newUser.username!,
      profilePicture: newUser.imageUrl
    });

    const signInToken = await this.clerkService.getSignInToken(newUser.id);

    return signInToken;
  }
}
