import { Repository } from '@core/repositories/repository';
import { OrganizationEntity } from '../entities/organization.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationRepository extends Repository<OrganizationEntity> {
  constructor() {
    super(OrganizationEntity);
  }

  getEntity(parameters: Partial<OrganizationEntity>): OrganizationEntity {
    return new OrganizationEntity(parameters);
  }
}
