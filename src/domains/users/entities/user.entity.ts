import { plainToInstance } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  walletAddress: string;

  @Column()
  profilePicture: string;

  constructor(props: Partial<UserEntity>) {
    const entity = plainToInstance(UserEntity, props);
    Object.assign(this, entity);
  }
}
