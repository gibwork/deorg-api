import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { DeepPartial, ObjectLiteral } from 'typeorm';
import { PaginatedDto } from '@core/pagination/paginated.dto';
import { PaginatedData } from '@core/pagination/paginated-data';
import { ICountParams } from '@core/repositories/types';

type DeepPartialWithBoolean<T> = {
  [K in keyof T]: T[K] extends object ? DeepPartialWithBoolean<T[K]> : boolean;
};

export interface IFindOneParams<Entity> {
  order?: FindOptionsOrder<ObjectLiteral>;
  where?: DeepPartial<Entity> | Array<DeepPartial<Entity>>;
  relations?: Record<string, any>;
  withDeleted?: boolean;
  select?: DeepPartial<any>;
}

export interface IFindParams<Entity> {
  skip?: number;
  take?: number;
  order?: FindOptionsOrder<Entity>;
  where?: DeepPartial<Entity> | Array<DeepPartial<Entity>>;
  orderBy?: Record<string, any>;
  relations?: Record<string, any>;
  withDeleted?: boolean;
  select?: DeepPartial<any>;
}

export interface IService<Entity> {
  findAndCount({
    paginate,
    relations,
    select
  }: {
    paginate: PaginatedDto;
    relations?: Record<string, any>;
    select?: DeepPartial<any>;
  }): Promise<PaginatedData<Entity>>;
  find(params: IFindParams<Entity>): Promise<Entity[]>;
  findOne(params: IFindOneParams<Entity>): Promise<Entity | null>;
  count(params: ICountParams<Entity>): Promise<number>;
  create(params: DeepPartial<Entity>): Promise<Entity>;
  update(id: string, params: DeepPartial<Entity>): Promise<Entity>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
