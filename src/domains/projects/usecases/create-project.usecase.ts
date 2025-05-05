import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { NotFoundException, Injectable } from '@nestjs/common';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection } from '@solana/web3.js';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ProposalService } from '@domains/proposals/services/proposal.service';
import { ProposalType } from '@domains/proposals/entities/proposal.entity';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { sendTransaction } from '@utils/sendTransaction';

@Injectable()
export class CreateProjectUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService,
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService
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

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    const organization = await this.organizationService.findOne({
      where: {
        accountAddress: transaction.request.organizationAccountAddress
      }
    });

    if (organization) {
      await this.proposalService.create({
        title: `Propose to create project ${transaction.request.name}`,
        accountAddress: transaction.request.proposalPDA,
        description: `Propose to create project ${transaction.request.name}`,
        organizationId: organization.id,
        createdBy: user.id,
        type: ProposalType.PROJECT
      });
    }

    return {
      ok: true
    };
  }
}
