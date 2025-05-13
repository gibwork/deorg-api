import { Connection } from '@solana/web3.js';
import { sendTransaction } from '@utils/sendTransaction';
import { HeliusService } from '@core/services/helius/helius.service';
import { Injectable } from '@nestjs/common';
import { DepositOrganizationDto } from '../dto/deposit-organization.dto';

@Injectable()
export class DepositOrganizationUsecase {
  constructor(private readonly heliusService: HeliusService) {}

  async execute(dto: DepositOrganizationDto) {
    const connection = new Connection(this.heliusService.rpcUrl);

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection
    });

    return {
      signature
    };
  }
}
