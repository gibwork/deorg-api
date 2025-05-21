import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { In } from 'typeorm';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class ListOrganizationsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly heliusService: HeliusService
  ) {}

  async execute() {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const organizations = await deorg.getOrganizations();
    const accountAddresses = organizations.map((org) => org.accountAddress);

    const organizationEntities = await this.organizationService.find({
      where: { accountAddress: In(accountAddresses) } as any,
      relations: {
        members: {
          user: true
        }
      }
    });

    const organizationsEnriched = organizations.map((org) => {
      const entity = organizationEntities.find(
        (e) => e.accountAddress === org.accountAddress
      );

      const members = [
        ...new Set([
          ...(entity?.members.map((m) => m.user.walletAddress) || []),
          ...(org.contributors || [])
        ])
      ];

      return {
        ...org,
        ...entity,
        members
      };
    });

    return organizationsEnriched.sort((a, b) => a.name.localeCompare(b.name));
  }
}
