import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProposalContributorTransactionDto {
  @ApiProperty({
    description: 'The ID of the organization',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: 'The wallet address of the candidate',
    example: 'Wallet address of the candidate'
  })
  @IsNotEmpty()
  @IsString()
  candidateWallet: string;
}
