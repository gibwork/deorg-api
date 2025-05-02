import { Injectable } from '@nestjs/common';
import { OrganizationMemberEntity } from '../entities/organization-member.entity';
import { Repository } from '@core/repositories/repository';

@Injectable()
export class OrganizationMemberRepository extends Repository<OrganizationMemberEntity> {
  constructor() {
    super(OrganizationMemberEntity);
  }

  getEntity(
    parameters: Partial<OrganizationMemberEntity>
  ): OrganizationMemberEntity {
    return new OrganizationMemberEntity(parameters);
  }
}
