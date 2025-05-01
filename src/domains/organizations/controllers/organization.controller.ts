import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateOrganizationUsecase } from '../usecases/create-organization.usecase';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { AuthGuard } from '@core/guards/auth.guard';
import { UserDecorator } from '@core/decorators/user.decorator';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('organizations')
@ApiTags('Organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createOrganization(
    @Body() body: CreateOrganizationDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createOrganizationUsecase.execute(body, user.id);
  }
}
