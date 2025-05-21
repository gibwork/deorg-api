import { HeliusService } from '@core/services/helius/helius.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProposalTaskTransactionDto } from '../dto/create-proposal-task-transaction.dto';
import { UserEntity } from '@domains/users/entities/user.entity';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';
import { Deorg } from '@deorg/node';

@Injectable()
export class CreateProposalTaskTransactionsUsecase {
  constructor(
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(dto: CreateProposalTaskTransactionDto, user: UserEntity) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainProject = await deorg.getProjectDetails(
      dto.projectAccountAddress
    );

    if (!onChainProject) {
      throw new NotFoundException('Project not found');
    }

    const { transaction: tx, proposalPDA } =
      await deorg.createTaskProposalTransaction({
        assignee: dto.memberAccountAddress,
        description: dto.description,
        organizationAddress: onChainProject.organization,
        paymentAmount: dto.paymentAmount,
        projectAddress: dto.projectAccountAddress,
        title: dto.title,
        proposerWallet: user.walletAddress
      });

    const transaction = await this.transactionService.create({
      createdBy: user.id,
      type: TransactionType.CREATE_TASK,
      request: {
        organizationId: onChainProject.organization,
        name: dto.title,
        members: [dto.memberAccountAddress],
        proposalPDA: proposalPDA.toBase58()
      }
    });

    return {
      serializedTransaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      transactionId: transaction.id
    };
  }
}
