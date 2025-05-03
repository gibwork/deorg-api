import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProposalProjectTransactionDto {
  @ApiProperty({
    description: 'The ID of the organization',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty({
    description: 'The name of the project',
    example: 'Project name'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The members of the project',
    example: ['Member 1', 'Member 2']
  })
  @IsNotEmpty()
  @IsArray()
  members: string[];

  @ApiProperty({
    description: 'The threshold for the project proposal',
    example: 100
  })
  @IsNotEmpty()
  @IsNumber()
  projectProposalThreshold: number;

  @ApiProperty({
    description: 'The validity period of the project proposal',
    example: 100
  })
  @IsNotEmpty()
  @IsNumber()
  projectProposalValidityPeriod: number;
}
