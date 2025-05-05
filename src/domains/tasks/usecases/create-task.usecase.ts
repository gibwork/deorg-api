import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Connection } from '@solana/web3.js';
import { UserEntity } from '@domains/users/entities/user.entity';
import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { HeliusService } from '@core/services/helius/helius.service';
import { sendTransaction } from '@utils/sendTransaction';

@Injectable()
export class CreateTaskUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: CreateTaskDto, user: UserEntity) {
    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: user.id,
        type: TransactionType.CREATE_TASK
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
      ok: true
    };
  }
}
