import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { CreateTaskUsecase } from '../usecases/create-task.usecase';
import { UserDecorator } from '@core/decorators/user.decorator';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@core/guards/auth.guard';
import { ListTasksUsecase } from '../usecases/list-tasks.usecase';
import { CompleteTaskDto } from '../dto/complete-task.dto';
import { CompleteTaskUsecase } from '../usecases/complete-task.usecase';
import { EnableWithdrawDto } from '../dto/enalbe-withdraw.dto';
import { EnableWithdrawUsecase } from '../usecases/enable-withdraw.usecase';
import { WithdrawTaskDto } from '../dto/withdraw-task.dto';
import { WithdrawTaskUsecase } from '../usecases/withdraw-task.usecase';
import { GetTaskDetailsUsecase } from '../usecases/ge-task-details.usecase';

@Controller('tasks')
@ApiTags('Tasks')
export class TasksController {
  constructor(
    private readonly createTaskUsecase: CreateTaskUsecase,
    private readonly listTasksUsecase: ListTasksUsecase,
    private readonly completeTaskUsecase: CompleteTaskUsecase,
    private readonly enableWithdrawUsecase: EnableWithdrawUsecase,
    private readonly withdrawTaskUsecase: WithdrawTaskUsecase,
    private readonly getTaskDetailsUsecase: GetTaskDetailsUsecase
  ) {}

  @Get('project/:projectAddress')
  async listTasks(@Param('projectAddress') projectAddress: string) {
    return this.listTasksUsecase.execute(projectAddress);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Body() dto: CreateTaskDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createTaskUsecase.execute(dto, user);
  }

  @Post('complete')
  @UseGuards(AuthGuard)
  async completeTask(
    @Body() dto: CompleteTaskDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.completeTaskUsecase.execute(dto, user);
  }

  @Post('enable-withdraw')
  @UseGuards(AuthGuard)
  async enableWithdraw(
    @Body() dto: EnableWithdrawDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.enableWithdrawUsecase.execute(dto, user);
  }

  @Post('withdraw-funds')
  @UseGuards(AuthGuard)
  async withdrawFunds(
    @Body() dto: WithdrawTaskDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.withdrawTaskUsecase.execute(dto, user);
  }

  @Get(':taskAddress')
  async getTaskDetails(@Param('taskAddress') taskAddress: string) {
    return this.getTaskDetailsUsecase.execute(taskAddress);
  }
}
