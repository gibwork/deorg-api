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
import { ProposalEntity } from '@domains/proposals/entities/proposal.entity';
export interface Token {
  symbol: string;
  mintAddress: string;
  amount: number;
  imageUrl: string;
}

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slug: string;

  @Column()
  externalId: string;

  @Column()
  logoUrl: string;

  @Column()
  createdBy: string;

  @Column({ unique: true })
  accountAddress: string;

  @Column({ type: 'jsonb', default: {} })
  token: Token;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.organizations)
  @JoinColumn({ name: 'created_by' })
  user: UserEntity;

  @OneToMany(() => OrganizationMemberEntity, (member) => member.organization, {
    cascade: true
  })
  members: OrganizationMemberEntity[];

  @OneToMany(() => ProposalEntity, (proposal) => proposal.organization, {
    cascade: true
  })
  proposals: ProposalEntity[];

  constructor(props: Partial<OrganizationEntity>) {
    const entity = plainToInstance(OrganizationEntity, props);
    Object.assign(this, entity);
  }
}
