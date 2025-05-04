import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { CreateTaskUsecase } from '../usecases/create-task.usecase';
import { UserDecorator } from '@core/decorators/user.decorator';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListTasksUsecase } from '../usecases/list-tasks.usecase';

@Controller('tasks')
@ApiTags('Tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(
    private readonly createTaskUsecase: CreateTaskUsecase,
    private readonly listTasksUsecase: ListTasksUsecase
  ) {}

  @Get('project/:projectAddress')
  async listTasks(@Param('projectAddress') projectAddress: string) {
    return this.listTasksUsecase.execute(projectAddress);
  }

  @Post()
  async createTask(
    @Body() dto: CreateTaskDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createTaskUsecase.execute(dto, user);
  }
}
