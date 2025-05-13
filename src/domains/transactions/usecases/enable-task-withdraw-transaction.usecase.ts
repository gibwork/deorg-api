import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { HeliusService } from '@core/services/helius/helius.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import { TransactionType } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';

@Injectable()
export class EnableTaskWithdrawTransactionUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(taskAddress: string, user: UserEntity) {
    const connection = new Connection(this.heliusService.devnetRpcUrl);

    const task = await this.votingProgramService.getTaskDetails(taskAddress);
    const project = await this.votingProgramService.getProjectDetails(
      task.project
    );
    const organization = await this.votingProgramService.getOrganizationDetails(
      project.organization
    );

    const { instruction } =
      await this.votingProgramService.enableTaskVaultWithdrawal(
        taskAddress,
        user.walletAddress,
        organization.tokenMint
      );

    const tx = new Transaction().add(instruction);

    tx.feePayer = new PublicKey(user.walletAddress);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const transaction = await this.transactionService.create({
      type: TransactionType.ENABLE_TASK_WITHDRAWAL,
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
