import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { DeepPartial, ObjectLiteral } from 'typeorm';
import { Repository as RepositoryTypeorm } from 'typeorm/repository/Repository';

export interface IFindOneParams<Entity> {
  order?: FindOptionsOrder<ObjectLiteral>;
  where?: DeepPartial<Entity> | Array<DeepPartial<Entity>>;
  relations?: Record<string, any>;
  select?: DeepPartial<Entity>;
  withDeleted?: boolean;
}

export interface IFindParams<Entity> {
  skip?: number;
  take?: number;
  order?: FindOptionsOrder<Entity>;
  where?: DeepPartial<Entity> | Array<DeepPartial<Entity>>;
  orderBy?: Record<string, any>;
  relations?: Record<string, any>;
  withDeleted?: boolean;
  select?: DeepPartial<Entity>;
}

export interface ICountParams<Entity> extends IFindParams<Entity> {}

export interface IRepository<Entity> {
  getMapper(): RepositoryTypeorm<ObjectLiteral>;
  findAndCount(
    params: IFindParams<Entity>
  ): Promise<{ results: Entity[]; count: number }>;
  find(params: IFindParams<Entity>): Promise<Entity[]>;
  findOne(params: IFindOneParams<Entity>): Promise<Entity | null>;
  create(params: DeepPartial<Entity>): Promise<Entity>;
  update(id: string, params: DeepPartial<Entity>): Promise<Entity>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  count(params: ICountParams<Entity>): Promise<number>;
}
