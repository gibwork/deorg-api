import { UserEntity } from '@domains/users/entities/user.entity';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { NotFoundException, Injectable } from '@nestjs/common';
import { EnableWithdrawDto } from '../dto/enalbe-withdraw.dto';
import { Connection } from '@solana/web3.js';
import { sendTransaction } from '@utils/sendTransaction';

@Injectable()
export class EnableWithdrawUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: EnableWithdrawDto, user: UserEntity) {
    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: user.id,
        type: TransactionType.ENABLE_TASK_WITHDRAWAL
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection,
      commitment: 'finalized'
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    return {
      signature
    };
  }
}
