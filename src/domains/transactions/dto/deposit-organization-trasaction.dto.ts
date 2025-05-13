import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DepositOrganizationTransactionDto {
  @ApiProperty({
    description: 'The token account address of the organization'
  })
  @IsString()
  organizationTokenAccount: string;

  @ApiProperty({
    description: 'The token mint address'
  })
  @IsString()
  tokenMint: string;

  @ApiProperty({
    description: 'The amount to deposit'
  })
  @IsNumber()
  amount: number;
}
