import { ICommonPaginatedData } from '@core/pagination/types';
import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedData<Entity> implements ICommonPaginatedData {
  @Expose()
  @IsNumber()
  @ApiProperty({ example: 1 })
  page: number | undefined;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 10 })
  limit: number | undefined;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 10 })
  lastPage: number;

  @Expose()
  @IsNumber()
  @ApiProperty({ example: 100 })
  total: number;

  @Expose()
  @ApiProperty({ example: [] })
  results: Entity[];

  constructor(params: Omit<PaginatedData<any>, 'lastPage'>) {
    this.lastPage = this.calculateLastPage(params);

    Object.assign(this, params);

    if (!params.limit) this.limit = params.total;
  }

  private calculateLastPage(
    params: Omit<PaginatedData<any>, 'lastPage'>,
  ): number {
    if (!params.limit) return 1;

    return params.total % params.limit !== 0
      ? Math.floor(params.total / params.limit) + 1
      : Math.floor(params.total / params.limit);
  }
}
