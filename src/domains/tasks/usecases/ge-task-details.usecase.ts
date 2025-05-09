import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetTaskDetailsUsecase {
  constructor(private readonly votingProgramService: VotingProgramService) {}

  async execute(taskAddress: string) {
    const task = await this.votingProgramService.getTaskDetails(taskAddress);

    return task;
  }
}
