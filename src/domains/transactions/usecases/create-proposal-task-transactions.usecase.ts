import { HeliusService } from '@core/services/helius/helius.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { CreateProposalTaskTransactionDto } from '../dto/create-proposal-task-transaction.dto';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';

@Injectable()
export class CreateProposalTaskTransactionsUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(dto: CreateProposalTaskTransactionDto, user: UserEntity) {
    const connection = new Connection(this.heliusService.devnetRpcUrl);

    const onChainProject = await this.votingProgramService.getProjectDetails(
      dto.projectAccountAddress
    );

    if (!onChainProject) {
      throw new NotFoundException('Project not found');
    }

    const { instruction, proposalPDA } =
      await this.votingProgramService.createTaskProposal({
        assignee: dto.memberAccountAddress,
        description: dto.description,
        organizationAddress: onChainProject.organization.toBase58(),
        paymentAmount: dto.paymentAmount,
        projectAddress: dto.projectAccountAddress,
        title: dto.title,
        userPrimaryWallet: user.walletAddress
      });

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);

    const transaction = await this.transactionService.create({
      createdBy: user.id,
      type: TransactionType.CREATE_TASK,
      request: {
        organizationId: onChainProject.organization.toBase58(),
        name: dto.title,
        members: [dto.memberAccountAddress],
        proposalPDA: proposalPDA.toBase58()
      }
    });

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    return {
      serializedTransaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      transactionId: transaction.id
    };
  }
}
