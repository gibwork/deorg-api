import { HeliusService } from '@core/services/helius/helius.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { Deorg } from '@deorg/node';

@Injectable()
export class EnableTaskWithdrawTransactionUsecase {
  constructor(
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(taskAddress: string, user: UserEntity) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const { transaction: tx } =
      await deorg.enableTaskVaultWithdrawalTransaction(
        taskAddress,
        user.walletAddress
      );

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
