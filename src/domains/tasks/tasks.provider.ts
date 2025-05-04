import { ModuleMetadata } from '@nestjs/common';
import { TasksController } from './controllers/tasks.controller';
import { CreateTaskUsecase } from './usecases/create-task.usecase';
import { ListTasksUsecase } from './usecases/list-tasks.usecase';
export const TasksProvider: ModuleMetadata = {
  controllers: [TasksController],
  providers: [CreateTaskUsecase, ListTasksUsecase]
};
