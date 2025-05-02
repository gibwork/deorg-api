import { UserEntity } from '@domains/users/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { CreateProposalContributorTransactionDto } from '../dto/create-proposal-contributor-transaction.dto';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class CreateProposalContributorTransactionUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly organizationService: OrganizationService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(
    dto: CreateProposalContributorTransactionDto,
    user: UserEntity
  ) {
    const connection = new Connection(this.heliusService.devnetRpcUrl);

    const organization = await this.organizationService.findOne({
      where: {
        id: dto.organizationId
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const contributors =
      await this.votingProgramService.getOrganizationContributors(
        organization.accountAddress
      );

    const publicUser = new PublicKey(user.walletAddress);

    if (contributors.includes(publicUser)) {
      throw new BadRequestException('Candidate is already a contributor');
    }

    console.log({
      organization: organization.accountAddress,
      candidate: dto.candidateWallet,
      proposer: user.walletAddress
    });

    const { instruction, proposalPDA } =
      await this.votingProgramService.createContributorProposal(
        organization.accountAddress,
        dto.candidateWallet,
        user.walletAddress
      );

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);

    const transaction = await this.transactionService.create({
      createdBy: user.id,
      type: TransactionType.PROPOSAL_CONTRIBUTOR,
      request: {
        organizationId: dto.organizationId,
        candidateWallet: dto.candidateWallet,
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
