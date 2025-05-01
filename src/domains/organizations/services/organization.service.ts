import { Injectable } from '@nestjs/common';
import { OrganizationEntity } from '../entities/organization.entity';
import { Service } from '@core/services/data/service';
import { OrganizationRepository } from '../repositories/organization.repository';

@Injectable()
export class OrganizationService extends Service<OrganizationEntity> {
  constructor(private readonly organizationRepository: OrganizationRepository) {
    super({ repository: organizationRepository, entityName: 'organization' });
  }
}
