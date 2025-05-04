import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProposalTaskTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  paymentAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  memberAccountAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectAccountAddress: string;
}
