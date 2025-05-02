import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateOrganizationUsecase } from '../usecases/create-organization.usecase';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { AuthGuard } from '@core/guards/auth.guard';
import { UserDecorator } from '@core/decorators/user.decorator';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListOrganizationsUsecase } from '../usecases/list-organizations.usecase';
import { JoinOrganizationUsecase } from '../usecases/join-organization.usecase';
@Controller('organizations')
@ApiTags('Organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
    private readonly listOrganizationsUsecase: ListOrganizationsUsecase,
    private readonly joinOrganizationUsecase: JoinOrganizationUsecase
  ) {}

  @Get()
  async listOrganizations() {
    return this.listOrganizationsUsecase.execute();
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createOrganization(
    @Body() body: CreateOrganizationDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createOrganizationUsecase.execute(body, user.id);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async joinOrganization(
    @Param('id') id: string,
    @UserDecorator() user: UserEntity
  ) {
    return this.joinOrganizationUsecase.execute(id, user.id);
  }
}
