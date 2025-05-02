import { Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../entities/organization.entity';
import { Service } from '@core/services/data/service';
import { OrganizationRepository } from '../repositories/organization.repository';
import { OrganizationRole } from '../entities/organization-member.entity';
@Injectable()
export class OrganizationService extends Service<OrganizationEntity> {
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super({ repository: organizationRepository, entityName: 'organization' });
  }

  getClerkRole(role: OrganizationRole): string {
    switch (role) {
      case OrganizationRole.ADMIN:
        return 'org:admin';
      case OrganizationRole.MEMBER:
        return 'org:member';
      default:
        return 'org:member';
    }
  }
}
