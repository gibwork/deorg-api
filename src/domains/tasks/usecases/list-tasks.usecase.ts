import { Injectable } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';

@Injectable()
export class ListTasksUsecase {
  constructor(private readonly votingProgramService: VotingProgramService) {}

  async execute(projectAddress: string) {
    const tasks = await this.votingProgramService.getTasks(projectAddress);

    return tasks;
  }
}
