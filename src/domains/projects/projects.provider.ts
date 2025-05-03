import { ModuleMetadata } from '@nestjs/common';
import { CreateProjectUsecase } from './usecases/create-project.usecase';
import { ProjectsController } from './controllers/projects.controller';

export const ProjectsProvider: ModuleMetadata = {
  controllers: [ProjectsController],
  providers: [CreateProjectUsecase]
};
