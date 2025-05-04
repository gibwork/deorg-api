import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { ProposalService } from '../services/proposal.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection, Transaction } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';

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

    const signedTransaction = Transaction.from(
      Buffer.from(dto.serializedTransaction, 'base64')
    );

    try {
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new BadRequestException(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      const txDetails = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!txDetails) {
        throw new BadRequestException('Failed to fetch transaction details');
      }

      if (txDetails.meta?.err) {
        throw new BadRequestException(
          `Transaction failed with error: ${JSON.stringify(txDetails.meta.err)}`
        );
      }

      await this.transactionService.update(transaction.id, {
        response: { txHash: signature }
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to send transaction');
    }

    return {
      message: 'Vote cast successfully'
    };
  }
}
