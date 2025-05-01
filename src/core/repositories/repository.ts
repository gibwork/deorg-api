import {
  DeepPartial,
  ObjectLiteral,
  Repository as RepositoryTypeorm
} from 'typeorm';
import {
  IFindOneParams,
  IFindParams,
  IRepository,
  ICountParams
} from '@core/repositories/types';
import database from '@core/infra/database/database';
import { NotFoundException } from '@nestjs/common';

export abstract class Repository<Entity> implements IRepository<Entity> {
  protected repository: RepositoryTypeorm<ObjectLiteral>;

  protected constructor(entity: any) {
    this.repository = database.getRepository(entity);
  }

  abstract getEntity(parameters: object): Entity;

  getMapper() {
    return this.repository;
  }

  async create(params: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.repository.save(params || {});
    return this.getEntity(entity);
  }

  async update(id: string, params: DeepPartial<Entity>): Promise<Entity> {
    const entityExists = await this.repository.findOne({ where: { id } });

    if (!entityExists) throw new NotFoundException('Entity not found');

    await this.repository.save({
      id,
      ...params
    });

    return (await this.findOne({ where: { id } } as any)) as Entity;
  }

  async findOne(params: IFindOneParams<Entity>): Promise<Entity | null> {
    const result = await this.repository.findOne({
      where: params.where || {},
      order: params.order,
      relations: params.relations,
      select: params.select || undefined,
      withDeleted: params.withDeleted
    });

    if (!result) return null;

    return this.getEntity(result);
  }

  async findAndCount(
    params: IFindParams<Entity>
  ): Promise<{ results: Entity[]; count: number }> {
    const [results, count] = await this.repository.findAndCount({
      skip: params.skip,
      take: params.take,
      where: params.where || {},
      order: params.order as any,
      relations: params.relations,
      withDeleted: params.withDeleted,
      select: params.select || undefined
    });

    return {
      results: results.map((entity: object) => this.getEntity(entity)),
      count
    };
  }

  async find(params: IFindParams<Entity>): Promise<Entity[]> {
    const results = await this.repository.find({
      skip: params.skip,
      take: params.take,
      where: params.where || {},
      order: params.order as any,
      relations: params.relations,
      withDeleted: params.withDeleted,
      select: params.select || undefined
    });

    return results.map((entity: object) => this.getEntity(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  async count(params: ICountParams<Entity>): Promise<number> {
    return this.repository.count({
      skip: params.skip,
      take: params.take,
      where: params.where || {},
      order: params.order as any,
      relations: params.relations,
      withDeleted: params.withDeleted,
      select: params.select || undefined
    });
  }
}
