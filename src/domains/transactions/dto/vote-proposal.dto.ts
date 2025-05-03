import { IsString } from 'class-validator';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteProposalDto {
  @ApiProperty({
    description: 'The vote to be cast',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  vote: boolean;

  @ApiProperty({
    description: 'The organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  organizationId: string;
}
