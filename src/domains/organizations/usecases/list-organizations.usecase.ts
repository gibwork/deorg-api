import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';

@Injectable()
export class ListOrganizationsUsecase {
  constructor(private readonly organizationService: OrganizationService) {}

  async execute() {
    return this.organizationService.find({});
  }
}
