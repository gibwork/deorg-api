import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VoteProposalDto {
  @ApiProperty({
    description: 'The transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  transactionId: string;

  @ApiProperty({
    description: 'The serialized transaction'
  })
  @IsString()
  serializedTransaction: string;
}
