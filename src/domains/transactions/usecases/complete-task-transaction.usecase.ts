import { HeliusService } from '@core/services/helius/helius.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { TransactionType } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { Injectable } from '@nestjs/common';
import { Deorg } from '@deorg/node';

@Injectable()
export class CompleteTaskTransactionUsecase {
  constructor(
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(taskAddress: string, user: UserEntity) {
    const dorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const { transaction: tx } = await dorg.completeTaskTransaction(taskAddress);

    const transaction = await this.transactionService.create({
      type: TransactionType.COMPLETE_TASK,
      createdBy: user.id,
      request: {
        taskAddress
      }
    });

    return {
      serializedTransaction: tx.serialize({
        requireAllSignatures: false
      }),
      transactionId: transaction.id
    };
  }
}
