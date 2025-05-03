import { OrganizationService } from '@domains/organizations/services/organization.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserOrganizationsUsecase {
  constructor(private readonly organizationService: OrganizationService) {}

  async execute(userId: string) {
    return this.organizationService.find({
      where: { members: { userId } } as any
    });
  }
}
