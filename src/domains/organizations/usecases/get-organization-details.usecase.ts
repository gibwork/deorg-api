import { Injectable } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class GetOrganizationDetailsUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(accountAddress: string) {
    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(accountAddress);

    const organization = await this.organizationService.findOne({
      where: {
        accountAddress
      },
      relations: {
        members: {
          user: true
        }
      }
    });

    const treasuryBalances: any[] = [];

    for (const balance of onChainOrganization.treasuryBalances) {
      const token = await this.heliusService.getDevnetTokenInfo(balance.mint);

      treasuryBalances.push({
        ...balance,
        token
      });
    }

    onChainOrganization.treasuryBalances = treasuryBalances;

    return { ...onChainOrganization, ...organization };
  }
}
