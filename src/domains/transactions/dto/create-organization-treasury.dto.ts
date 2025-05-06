import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

export class CreateOrganizationTreasuryDto {
  @ApiProperty({
    description: 'The ID of the organization to create the treasury for'
  })
  @IsNotEmpty()
  @IsString()
  organizationId: string;
}
