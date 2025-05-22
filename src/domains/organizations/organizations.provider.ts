import { ModuleMetadata } from '@nestjs/common';
import { OrganizationService } from './services/organization.service';
import { OrganizationRepository } from './repositories/organization.repository';
import { OrganizationController } from './controllers/organization.controller';
import { CreateOrganizationUsecase } from './usecases/create-organization.usecase';
import { ListOrganizationsUsecase } from './usecases/list-organizations.usecase';
import { JoinOrganizationUsecase } from './usecases/join-organization.usecase';
import { OrganizationMemberService } from './services/organization-member.service';
import { OrganizationMemberRepository } from './repositories/organization-member.repository';
import { GetOrganizationDetailsUsecase } from './usecases/get-organization-details.usecase';
import { CheckOrganizationMembershipUsecase } from './usecases/check-organization-membership.usecase';
import { GetOrganizationMembersUseCase } from './usecases/get-organization-members.use-case';
import { GetOrganizationBalanceUseCase } from './usecases/get-organization-balance.usecase';

export const OrganizationsProvider: ModuleMetadata = {
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationMemberService,
    OrganizationMemberRepository,
    CreateOrganizationUsecase,
    ListOrganizationsUsecase,
    JoinOrganizationUsecase,
    GetOrganizationDetailsUsecase,
    CheckOrganizationMembershipUsecase,
    GetOrganizationMembersUseCase,
    GetOrganizationBalanceUseCase
  ]
};
