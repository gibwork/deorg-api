import { Injectable } from '@nestjs/common';
import { TransactionEntity } from '../entities/transaction.entity';
import { Service } from '@core/services/data/service';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService extends Service<TransactionEntity> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super({ repository: transactionRepository, entityName: 'transaction' });
  }
}
