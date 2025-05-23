import { UserEntity } from '@domains/users/entities/user.entity';
import { UserDecorator } from '@core/decorators/user.decorator';
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateProjectUsecase } from '../usecases/create-project.usecase';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListProjectsUsecase } from '../usecases/list-projects.usecase';
import { GetProjectDetailsUsecase } from '../usecases/get-project-details.usecase';

@Controller('projects')
@ApiTags('Projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUsecase: CreateProjectUsecase,
    private readonly listProjectsUsecase: ListProjectsUsecase,
    private readonly getProjectDetailsUsecase: GetProjectDetailsUsecase
  ) {}

  @Get('/organization/:orgAccountAddress')
  async listProjects(@Param('orgAccountAddress') orgAccountAddress: string) {
    return this.listProjectsUsecase.execute(orgAccountAddress);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProject(
    @Body() body: CreateProjectDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createProjectUsecase.execute(body, user);
  }

  @Get('/:projectAccountAddress')
  async getProject(
    @Param('projectAccountAddress') projectAccountAddress: string
  ) {
    return this.getProjectDetailsUsecase.execute(projectAccountAddress);
  }
}
