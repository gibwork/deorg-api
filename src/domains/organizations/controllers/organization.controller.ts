import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateOrganizationUsecase } from '../usecases/create-organization.usecase';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { AuthGuard } from '@core/guards/auth.guard';
import { UserDecorator } from '@core/decorators/user.decorator';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListOrganizationsUsecase } from '../usecases/list-organizations.usecase';
import { JoinOrganizationUsecase } from '../usecases/join-organization.usecase';
import { GetOrganizationDetailsUsecase } from '../usecases/get-organization-details.usecase';
import { CheckOrganizationMembershipUsecase } from '../usecases/check-organization-membership.usecase';
import { GetOrganizationMembersUseCase } from '../usecases/get-organization-members.use-case';

@Controller('organizations')
@ApiTags('Organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUsecase: CreateOrganizationUsecase,
    private readonly listOrganizationsUsecase: ListOrganizationsUsecase,
    private readonly joinOrganizationUsecase: JoinOrganizationUsecase,
    private readonly getOrganizationDetailsUsecase: GetOrganizationDetailsUsecase,
    private readonly checkMembershipUsecase: CheckOrganizationMembershipUsecase,
    private readonly getOrganizationMembersUseCase: GetOrganizationMembersUseCase
  ) {}

  @Get()
  async listOrganizations() {
    return this.listOrganizationsUsecase.execute();
  }

  @Get(':accountAddress')
  async getOrganization(@Param('accountAddress') accountAddress: string) {
    return this.getOrganizationDetailsUsecase.execute(accountAddress);
  }

  @Get(':accountAddress/members')
  async getOrganizationMembers(
    @Param('accountAddress') accountAddress: string
  ) {
    return this.getOrganizationMembersUseCase.execute(accountAddress);
  }

  @Get(':accountAddress/check-membership')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async checkMembership(
    @Param('accountAddress') accountAddress: string,
    @UserDecorator() user: UserEntity
  ) {
    return this.checkMembershipUsecase.execute(accountAddress, user);
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

  @Post(':accountAddress/join')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async joinOrganization(
    @Param('accountAddress') accountAddress: string,
    @UserDecorator() user: UserEntity
  ) {
    return this.joinOrganizationUsecase.execute(accountAddress, user.id);
  }
}
