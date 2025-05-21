import { Injectable } from '@nestjs/common';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class GetTaskDetailsUsecase {
  constructor(private readonly heliusService: HeliusService) {}

  async execute(taskAddress: string) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const task = await deorg.getTaskDetails(taskAddress);

    return task;
  }
}
