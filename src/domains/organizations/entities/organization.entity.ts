import { plainToInstance } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from '@domains/users/entities/user.entity';
import { OrganizationMemberEntity } from './organization-member.entity';

export interface Token {
  symbol: string;
  mintAddress: string;
  amount: number;
  imageUrl: string;
}

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'jsonb', default: {} })
  token?: Token;

  @Column()
  name: string;

  @Column()
  logoUrl: string;

  @Column()
  createdBy: string;

  @Column()
  accountAddress: string;

  @ManyToOne(() => UserEntity, (user) => user.organizations)
  @JoinColumn({ name: 'created_by' })
  user: UserEntity;

  @OneToMany(() => OrganizationMemberEntity, (member) => member.organization, {
    cascade: true
  })
  members: OrganizationMemberEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(props: Partial<OrganizationEntity>) {
    const entity = plainToInstance(OrganizationEntity, props);
    Object.assign(this, entity);
  }
}
