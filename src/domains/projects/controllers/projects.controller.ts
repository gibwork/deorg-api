import { UserEntity } from '@domains/users/entities/user.entity';
import { UserDecorator } from '@core/decorators/user.decorator';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { CreateProjectUsecase } from '../usecases/create-project.usecase';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core/guards/auth.guard';

@Controller('projects')
@ApiTags('Projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly createProjectUsecase: CreateProjectUsecase) {}

  @Post()
  async createProject(
    @Body() body: CreateProjectDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createProjectUsecase.execute(body, user);
  }
}
