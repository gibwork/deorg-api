import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';

@Injectable()
export class GetOrganizationDetailsUsecase {
  constructor(private readonly organizationService: OrganizationService) {}

  async execute(id: string) {
    return this.organizationService.findOne({
      where: { id },
      relations: { members: { user: true } }
    });
  }
}
