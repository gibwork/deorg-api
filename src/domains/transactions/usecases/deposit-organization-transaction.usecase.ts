import { Injectable } from '@nestjs/common';
import { DepositOrganizationTransactionDto } from '../dto/deposit-organization-trasaction.dto';
import { Connection, Transaction } from '@solana/web3.js';
import { createTransferInstruction } from '@solana/spl-token';
import { UserEntity } from '@domains/users/entities/user.entity';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class DepositOrganizationTransactionUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(dto: DepositOrganizationTransactionDto, user: UserEntity) {
    const connection = new Connection(this.heliusService.rpcUrl);
    const organizationDetails: any =
      await this.votingProgramService.getOrganizationDetails(
        dto.organizationTokenAccount
      );

    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(dto.tokenMint),
      new PublicKey(user.walletAddress)
    );

    // Convert amount to raw value using decimals
    const rawAmount = Math.floor(
      parseFloat(dto.amount.toString()) * Math.pow(10, 6)
    );

    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(user.walletAddress);

    console.log({
      from: userTokenAccount.toBase58(), // from
      to: dto.organizationTokenAccount, // to
      mint: dto.tokenMint, // mint
      amount: rawAmount
    });

    // Add transfer instruction
    const transferInstruction = createTransferInstruction(
      userTokenAccount, // from
      new PublicKey(organizationDetails.treasuryTokenAccount), // to
      new PublicKey(user.walletAddress), // owner (signer)
      BigInt(rawAmount)
    );

    transaction.add(transferInstruction);

    return {
      serializedTransaction: transaction
        .serialize({ requireAllSignatures: false })
        .toString('base64')
    };
  }
}
