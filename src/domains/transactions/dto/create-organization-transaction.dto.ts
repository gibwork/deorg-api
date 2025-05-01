import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositOrganizationDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'My Organization'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The contributor proposal threshold',
    example: 60
  })
  @IsNumber()
  contributorProposalThreshold: number;

  @ApiProperty({
    description: 'The contributor proposal validity period',
    example: 7
  })
  @IsNumber()
  contributorProposalValidityPeriod: number;

  @ApiProperty({
    description: 'The contributor validity period',
    example: 30
  })
  @IsNumber()
  contributorValidityPeriod: number;

  @ApiProperty({
    description: 'The contributor proposal quorum percentage',
    example: 60
  })
  @IsNumber()
  contributorProposalQuorumPercentage: number;

  @ApiProperty({
    description: 'The project proposal threshold',
    example: 70
  })
  @IsNumber()
  projectProposalValidityPeriod: number;

  @ApiProperty({
    description: 'The minimum token requirement',
    example: 100
  })
  @IsNumber()
  projectProposalThreshold: number;

  @ApiProperty({
    description: 'The minimum token requirement',
    example: 100
  })
  @IsNumber()
  minimumTokenRequirement: number;
}
