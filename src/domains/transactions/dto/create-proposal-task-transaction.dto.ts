import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProposalTaskTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(110)
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
