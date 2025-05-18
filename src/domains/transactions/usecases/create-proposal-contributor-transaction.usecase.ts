import { UserEntity } from '@domains/users/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
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

    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(
        dto.organizationId
      );

    const contributors =
      await this.votingProgramService.getOrganizationContributors(
        onChainOrganization.accountAddress
      );

    const publicUser = new PublicKey(user.walletAddress);

    if (contributors.includes(publicUser)) {
      throw new BadRequestException('Candidate is already a contributor');
    }

    const { instruction, proposalPDA } =
      await this.votingProgramService.createContributorProposal({
        organizationAccount: onChainOrganization.accountAddress,
        candidateWallet: dto.candidateWallet,
        proposerWallet: user.walletAddress,
        proposedRate: dto.proposedRate,
        token: onChainOrganization.treasuryBalances[0].mint
      });

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
