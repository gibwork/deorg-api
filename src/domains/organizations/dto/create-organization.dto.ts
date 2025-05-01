import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsString, IsUrl, ValidateNested } from 'class-validator';
import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class TokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  mintAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  transactionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serializedTransaction: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TokenDto)
  token?: TokenDto;
}
