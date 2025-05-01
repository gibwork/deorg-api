import { plainToInstance } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { UserEntity } from '@domains/users/entities/user.entity';

export enum TransactionType {
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION'
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  txHash: string;

  @Column({ type: 'jsonb', default: {} })
  request: any;

  @Column({ type: 'jsonb', default: {} })
  response: any;

  @Column()
  createdBy: string;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  @JoinColumn({ name: 'created_by' })
  user: UserEntity;

  constructor(props: Partial<TransactionEntity>) {
    const entity = plainToInstance(TransactionEntity, props);
    Object.assign(this, entity);
  }
}
