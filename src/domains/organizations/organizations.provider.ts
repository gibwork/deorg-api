import { ModuleMetadata } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationController } from './controllers/organization.controller';
import { CreateOrganizationUsecase } from './usecases/create-organization.usecase';

export const OrganizationsProvider: ModuleMetadata = {
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    CreateOrganizationUsecase
  ]
};
