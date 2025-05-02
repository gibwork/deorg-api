import { plainToInstance } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { OrganizationEntity } from '@domains/organizations/entities/organization.entity';

@Entity('proposals')
export class ProposalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  accountAddress: string;

  @Column()
  organizationId: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.proposals)
  organization: OrganizationEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(props: Partial<ProposalEntity>) {
    const entity = plainToInstance(ProposalEntity, props);
    Object.assign(this, entity);
  }
}
