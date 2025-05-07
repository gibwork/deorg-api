import { ModuleMetadata } from '@nestjs/common';
import { TasksController } from './controllers/tasks.controller';
import { CreateTaskUsecase } from './usecases/create-task.usecase';
import { ListTasksUsecase } from './usecases/list-tasks.usecase';
import { CompleteTaskUsecase } from './usecases/complete-task.usecase';
import { EnableWithdrawUsecase } from './usecases/enable-withdraw.usecase';

export const TasksProvider: ModuleMetadata = {
  controllers: [TasksController],
  providers: [
    CreateTaskUsecase,
    ListTasksUsecase,
    CompleteTaskUsecase,
    EnableWithdrawUsecase
  ]
};
