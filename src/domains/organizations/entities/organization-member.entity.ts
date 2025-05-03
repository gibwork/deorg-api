import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '@domains/users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
export enum OrganizationRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  CONTRIBUTOR = 'CONTRIBUTOR'
}

@Entity('organization_members')
export class OrganizationMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER
  })
  role: OrganizationRole;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.members)
  organization: OrganizationEntity;

  @ManyToOne(() => UserEntity, (user) => user.organizationMembers)
  user: UserEntity;

  constructor(parameters: Partial<OrganizationMemberEntity>) {
    const entity = plainToInstance(OrganizationMemberEntity, parameters);
    Object.assign(this, entity);
  }
}
