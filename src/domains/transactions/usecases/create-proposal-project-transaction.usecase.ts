import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { CreateProposalProjectTransactionDto } from '../dto/create-proposal-project-transaction.dto';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { UserEntity } from '@domains/users/entities/user.entity';
import { HeliusService } from '@core/services/helius/helius.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateProposalProjectTransactionUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(dto: CreateProposalProjectTransactionDto, user: UserEntity) {
    const connection = new Connection(this.heliusService.devnetRpcUrl);

    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(
        dto.organizationId
      );

    const contributors =
      await this.votingProgramService.getOrganizationContributors(
        onChainOrganization.accountAddress
      );

    const publicUser = new PublicKey(user.walletAddress);

    if (
      !contributors.map((c) => c.toBase58()).includes(publicUser.toBase58())
    ) {
      throw new BadRequestException('User is not a contributor');
    }

    const members = dto.members.map((member) => new PublicKey(member));

    // validate if all members are contributors
    const allMembersAreContributors = dto.members.every((member) =>
      contributors.map((c) => c.toBase58()).includes(member)
    );

    if (!allMembersAreContributors) {
      throw new BadRequestException('All members must be contributors');
    }

    const projectId = uuidv4();

    const { instruction, proposalPDA } =
      await this.votingProgramService.createProjectProposal({
        id: projectId,
        name: dto.name,
        description: dto.description,
        members,
        organizationAddress: onChainOrganization.accountAddress,
        projectProposalThreshold: dto.projectProposalThreshold,
        projectProposalValidityPeriod: dto.projectProposalValidityPeriod,
        proposerWallet: user.walletAddress
      });

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);

    const transaction = await this.transactionService.create({
      createdBy: user.id,
      type: TransactionType.PROPOSAL_PROJECT,
      request: {
        organizationAccountAddress: onChainOrganization.accountAddress,
        organizationId: onChainOrganization.uuid,
        name: dto.name,
        members: dto.members,
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
