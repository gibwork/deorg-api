import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CompleteTaskDto {
  @ApiProperty({
    description: 'The id of the transaction'
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'The serialized transaction'
  })
  @IsString()
  @IsNotEmpty()
  serializedTransaction: string;
}
