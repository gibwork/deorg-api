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
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
  CREATE_ORGANIZATION_TREASURY = 'CREATE_ORGANIZATION_TREASURY',
  PROPOSAL_CONTRIBUTOR = 'PROPOSAL_CONTRIBUTOR',
  VOTE_CONTRIBUTOR_PROPOSAL = 'VOTE_CONTRIBUTOR_PROPOSAL',
  VOTE_PROJECT_PROPOSAL = 'VOTE_PROJECT_PROPOSAL',
  PROPOSAL_PROJECT = 'PROPOSAL_PROJECT',
  CREATE_TASK = 'CREATE_TASK',
  COMPLETE_TASK = 'COMPLETE_TASK',
  ENABLE_TASK_WITHDRAWAL = 'ENABLE_TASK_WITHDRAWAL',
  WITHDRAW_TASK_FUNDS = 'WITHDRAW_TASK_FUNDS'
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
