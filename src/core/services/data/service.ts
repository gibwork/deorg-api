import {
  IFindOneParams,
  IFindParams,
  IService
} from '@core/services/data/types';
import { IRepository, ICountParams } from '@core/repositories/types';
import { DeepPartial } from 'typeorm';
import { PaginatedDto } from '@core/pagination/paginated.dto';
import { PaginatedData } from '@core/pagination/paginated-data';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export abstract class Service<Entity> implements IService<Entity> {
  protected entityName: string;

  protected repository: IRepository<Entity>;

  protected sendEvents = true;

  @Inject()
  private eventEmitter: EventEmitter2;

  protected constructor({
    repository,
    entityName
  }: {
    repository: IRepository<Entity>;
    entityName: string;
  }) {
    this.repository = repository;
    this.entityName = entityName;
  }

  async create(params: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.repository.create(params);

    if (this.sendEvents) {
      this.eventEmitter.emit(`${this.entityName}.created`, entity);
    }

    return entity;
  }

  async update(id: string, params: DeepPartial<Entity>): Promise<Entity> {
    const oldEntity = await this.repository.findOne({ where: { id } as any });
    const entity = await this.repository.update(id, params);

    this.eventEmitter.emit(`${this.entityName}.updated`, {
      oldEntity,
      newEntity: entity
    });

    return entity;
  }

  async findAndCount({
    paginate,
    relations,
    select
  }: {
    paginate: PaginatedDto;
    relations?: Record<string, any>;
    select?: DeepPartial<any>;
  }): Promise<PaginatedData<Entity>> {
    const { results, count } = await this.repository.findAndCount({
      skip: paginate.getSkip(),
      take: paginate.getTake(),
      where: paginate.getWhere() as any,
      order: paginate.getOrder() as any,
      relations,
      select
    });

    return new PaginatedData({
      page: paginate.getPage(),
      limit: paginate.getLimit(),
      total: count,
      results
    });
  }

  find(params: IFindParams<Entity>): Promise<Entity[]> {
    return this.repository.find(params);
  }

  findOne(params: IFindOneParams<Entity>): Promise<Entity | null> {
    return this.repository.findOne(params);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  restore(id: string): Promise<void> {
    return this.repository.restore(id);
  }

  count(params: ICountParams<Entity>): Promise<number> {
    return this.repository.count(params);
  }
}
