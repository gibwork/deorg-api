import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection, Transaction } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class CreateContributorProposalUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(organizationId: string, dto: CreateContributorProposalDto) {
    const organization = await this.organizationService.findOne({
      where: {
        id: organizationId
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
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

      // Wait for confirmation with more robust error handling
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      // Check if there were any errors during confirmation
      if (confirmation.value.err) {
        throw new BadRequestException(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      // Get the transaction details to verify success
      const txDetails = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 1
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
      console.error('Error processing transaction:', error);
      throw new BadRequestException(
        `Failed to process transaction: ${error.message}`
      );
    }

    const proposal = await this.proposalService.create({
      organizationId,
      title: `Propose ${transaction.request['candidateWallet']} as a contributor`,
      description: `Propose ${transaction.request['candidateWallet']} as a contributor to the organization ${organization.name}`,
      accountAddress: transaction.request['proposalPDA'],
      createdBy: transaction.createdBy
    });

    return proposal;
  }
}
