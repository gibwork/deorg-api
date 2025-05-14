import { CompleteTaskDto } from '../dto/complete-task.dto';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { sendTransaction } from '@utils/sendTransaction';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompleteTaskUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: CompleteTaskDto, user: UserEntity) {
    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: user.id
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection,
      commitment: 'confirmed'
    });

    return {
      signature
    };
  }
}
