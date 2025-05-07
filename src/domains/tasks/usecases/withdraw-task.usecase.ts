import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { WithdrawTaskDto } from '../dto/withdraw-task.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { sendTransaction } from '@utils/sendTransaction';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class WithdrawTaskUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: WithdrawTaskDto, user: UserEntity) {
    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: user.id,
        type: TransactionType.WITHDRAW_TASK_FUNDS
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    return {
      signature
    };
  }
}
