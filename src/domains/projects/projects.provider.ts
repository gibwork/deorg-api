import { ModuleMetadata } from '@nestjs/common';
import { CreateProjectUsecase } from './usecases/create-project.usecase';
import { ProjectsController } from './controllers/projects.controller';
import { ListProjectsUsecase } from './usecases/list-projects.usecase';
import { GetProjectDetailsUsecase } from './usecases/get-project-details.usecase';

export const ProjectsProvider: ModuleMetadata = {
  controllers: [ProjectsController],
  providers: [
    CreateProjectUsecase,
    ListProjectsUsecase,
    GetProjectDetailsUsecase
  ]
};
