import { Injectable } from '@nestjs/common';
import { OrganizationMemberEntity } from '../entities/organization-member.entity';
import { OrganizationMemberRepository } from '../repositories/organization-member.repository';
import { Service } from '@core/services/data/service';

@Injectable()
export class OrganizationMemberService extends Service<OrganizationMemberEntity> {
  constructor(
    private readonly organizationMemberRepository: OrganizationMemberRepository
  ) {
    super({
      repository: organizationMemberRepository,
      entityName: 'organizationMember'
    });
  }
}
