import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProjectDetailsUsecase {
  constructor(private readonly votingProgramService: VotingProgramService) {}

  async execute(projectAccountAddress: string) {
    const project = await this.votingProgramService.getProjectDetails(
      projectAccountAddress
    );

    return project;
  }
}
