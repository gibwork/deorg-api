import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { TransactionType } from '@domains/transactions/entities/transaction.entity';

@Injectable()
export class WithdrawTaskTransactionUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(taskAddress: string, user: UserEntity) {
    const { instruction } =
      await this.votingProgramService.withdrawTaskFunds(taskAddress);

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);
    const connection = new Connection(this.heliusService.devnetRpcUrl);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const transaction = await this.transactionService.create({
      type: TransactionType.WITHDRAW_TASK_FUNDS,
      createdBy: user.id,
      request: {
        taskAddress
      }
    });

    return {
      serializedTransaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      transactionId: transaction.id
    };
  }
}
