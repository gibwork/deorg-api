import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { sendTransaction } from '@utils/sendTransaction';
import { Deorg } from '@deorg/node';

@Injectable()
export class VoteProposalUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(
    proposalAccountAddress: string,
    orgAccountAddress: string,
    dto: VoteProposalDto
  ) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainProposal =
      await deorg.getOrganizationProposals(orgAccountAddress);

    if (!onChainProposal) {
      throw new NotFoundException('Proposal not found');
    }

    const proposal = onChainProposal.find(
      (proposal) => proposal.proposalAddress === proposalAccountAddress
    );

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
