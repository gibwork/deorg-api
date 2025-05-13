import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DepositOrganizationDto {
  @ApiProperty({
    description: 'The serialized transaction'
  })
  @IsString()
  serializedTransaction: string;
}
