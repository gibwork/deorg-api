import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { ProposalService } from '../services/proposal.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { sendTransaction } from '@utils/sendTransaction';
@Injectable()
export class VoteProposalUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(proposalAccountAddress: string, dto: VoteProposalDto) {
    const proposal = await this.proposalService.findOne({
      where: {
        accountAddress: proposalAccountAddress
      }
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId
      }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    return {
      message: 'Vote cast successfully'
    };
  }
}
