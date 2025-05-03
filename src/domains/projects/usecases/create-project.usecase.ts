import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import {
  NotFoundException,
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection, Transaction } from '@solana/web3.js';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ProposalService } from '@domains/proposals/services/proposal.service';
import { ProposalType } from '@domains/proposals/entities/proposal.entity';
@Injectable()
export class CreateProjectUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService,
    private readonly proposalService: ProposalService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: CreateProjectDto, user: UserEntity) {
    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: user.id,
        type: TransactionType.PROPOSAL_PROJECT
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

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

    await this.proposalService.create({
      title: `Propose to create project ${transaction.request.name}`,
      accountAddress: transaction.request.proposalPDA,
      description: `Propose to create project ${transaction.request.name}`,
      organizationId: transaction.request.organizationId,
      createdBy: user.id,
      type: ProposalType.PROJECT
    });

    return {
      ok: true
    };
  }
}
