import { Injectable, NotFoundException } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { OrganizationService } from '@domains/organizations/services/organization.service';

@Injectable()
export class ListProjectsUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly organizationService: OrganizationService
  ) {}

  async execute(organizationId: string) {
    const organization = await this.organizationService.findOne({
      where: { id: organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const projects = await this.votingProgramService.getOrganizationProjects(
      organization.accountAddress!
    );

    return projects.map((project) => ({
      ...project,
      uuid: convertUuid(project.uuid)
    }));
  }
}

function convertUuid(uuidArray: number[]) {
  const hex = uuidArray.map((b) => b.toString(16).padStart(2, '0'));

  // Monta no formato padrão de UUID
  const uuid = [
    hex.slice(0, 4).join(''), // 8 chars
    hex.slice(4, 6).join(''), // 4 chars
    hex.slice(6, 8).join(''), // 4 chars
    hex.slice(8, 10).join(''), // 4 chars
    hex.slice(10, 16).join('') // 12 chars
  ].join('-');

  return uuid;
}
