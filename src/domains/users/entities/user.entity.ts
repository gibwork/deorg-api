import { plainToInstance } from 'class-transformer';
import { TransactionEntity } from '@domains/transactions/entities/transaction.entity';
import { OrganizationEntity } from '@domains/organizations/entities/organization.entity';
import { OrganizationMemberEntity } from '@domains/organizations/entities/organization-member.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  externalId: string;

  @Column()
  username: string;

  @Column()
  walletAddress: string;

  @Column()
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];

  @OneToMany(() => OrganizationEntity, (organization) => organization.user)
  organizations: OrganizationEntity[];

  @OneToMany(() => OrganizationMemberEntity, (member) => member.user)
  organizationMembers: OrganizationMemberEntity[];

  constructor(props: Partial<UserEntity>) {
    const entity = plainToInstance(UserEntity, props);
    Object.assign(this, entity);
  }
}
