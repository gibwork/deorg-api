import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTreasuryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serializedTransaction: string;
}
