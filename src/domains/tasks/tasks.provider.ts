import { ModuleMetadata } from '@nestjs/common';
import { TasksController } from './controllers/tasks.controller';
import { CreateTaskUsecase } from './usecases/create-task.usecase';
import { ListTasksUsecase } from './usecases/list-tasks.usecase';
import { CompleteTaskUsecase } from './usecases/complete-task.usecase';
import { EnableWithdrawUsecase } from './usecases/enable-withdraw.usecase';
import { WithdrawTaskUsecase } from './usecases/withdraw-task.usecase';
import { GetTaskDetailsUsecase } from './usecases/ge-task-details.usecase';
export const TasksProvider: ModuleMetadata = {
  controllers: [TasksController],
  providers: [
    CreateTaskUsecase,
    ListTasksUsecase,
    CompleteTaskUsecase,
    EnableWithdrawUsecase,
    WithdrawTaskUsecase,
    GetTaskDetailsUsecase
  ]
};
