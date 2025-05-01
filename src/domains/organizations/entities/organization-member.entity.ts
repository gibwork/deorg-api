import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from '@domains/users/entities/user.entity';

export enum OrganizationRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

@Entity('organization_members')
export class OrganizationMemberEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
}
