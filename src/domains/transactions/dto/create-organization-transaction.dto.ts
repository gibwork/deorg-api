import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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

  @ApiProperty({
    description: 'The treasury transfer threshold percentage',
    example: 70
  })
  @IsNumber()
  @IsOptional()
  treasuryTransferThresholdPercentage: number;

  @ApiProperty({
    description: 'The treasury transfer proposal validity period',
    example: 14
  })
  @IsNumber()
  @IsOptional()
  treasuryTransferProposalValidityPeriod: number;

  @ApiProperty({
    description: 'The treasury transfer quorum percentage',
    example: 40
  })
  @IsNumber()
  @IsOptional()
  treasuryTransferQuorumPercentage: number;

  @ApiProperty({
    description: 'The logo URL',
    example: 'https://example.com/logo.png'
  })
  @IsString()
  @IsOptional()
  logoUrl: string;

  @ApiProperty({
    description: 'The website URL',
    example: 'https://example.com'
  })
  @IsString()
  @IsOptional()
  websiteUrl: string;

  @ApiProperty({
    description: 'The twitter URL',
    example: 'https://x.com/example'
  })
  @IsString()
  @IsOptional()
  twitterUrl: string;

  @ApiProperty({
    description: 'The discord URL',
    example: 'https://discord.com/example'
  })
  @IsString()
  @IsOptional()
  discordUrl: string;

  @ApiProperty({
    description: 'The telegram URL',
    example: 'https://t.me/example'
  })
  @IsString()
  @IsOptional()
  telegramUrl: string;

  @ApiProperty({
    description: 'The description',
    example: 'This is a description'
  })
  @IsString()
  @IsOptional()
  description: string;
}
