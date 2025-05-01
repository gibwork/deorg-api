import { Injectable } from '@nestjs/common';
import { Repository } from '@core/repositories/repository';
import { TransactionEntity } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
  constructor() {
    super(TransactionEntity);
  }

  getEntity(parameters: Partial<TransactionEntity>): TransactionEntity {
    return new TransactionEntity(parameters);
  }
}
