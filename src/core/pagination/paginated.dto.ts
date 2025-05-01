import { ICommonPaginatedData } from '@core/pagination/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

export class PaginatedDto implements ICommonPaginatedData {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @Expose()
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform((value) => (value.value ? Number(value.value) : 1))
  page: number;

  @ApiProperty({ required: false, default: 15, minimum: 1 })
  @Expose()
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform((value) => (value.value ? Number(value.value) : 15))
  limit: number;

  @ApiProperty({ required: false, default: false })
  @Expose()
  @IsBoolean()
  @IsOptional()
  @Transform((value) => !!(value.value && value.value.toString() === 'true'))
  pageAll: boolean;

  @ApiProperty({ required: false, minLength: 1 })
  @Expose()
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  orderBy: string;

  getOrder(): Record<string, 'ASC' | 'DESC'> {
    if (!this.orderBy) {
      return {};
    }

    const direction = this.orderBy.startsWith('-') ? 'ASC' : 'DESC';
    const columName = this.orderBy.startsWith('-')
      ? this.orderBy.slice(1)
      : this.orderBy;

    return { [columName]: direction };
  }

  getPage(): number | undefined {
    return this.pageAll ? undefined : this.page;
  }

  getLimit(): number | undefined {
    return this.pageAll ? undefined : this.limit;
  }

  getSkip(): number | undefined {
    return this.pageAll ? undefined : ((this.page || 1) - 1) * this.limit;
  }

  getTake(): number | undefined {
    return this.pageAll ? undefined : this.limit;
  }

  getWhere(): Record<string, any> {
    return {};
  }
}
