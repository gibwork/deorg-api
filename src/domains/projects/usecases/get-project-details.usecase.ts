import { Injectable } from '@nestjs/common';
import { Deorg } from '@deorg/node';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class GetProjectDetailsUsecase {
  constructor(private readonly heliusService: HeliusService) {}

  async execute(projectAccountAddress: string) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const project = await deorg.getProjectDetails(projectAccountAddress);

    return project;
  }
}
