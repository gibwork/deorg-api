import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { ProposalService } from '@domains/proposals/services/proposal.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { UserService } from '@domains/users/services/user.service';
import { Transaction } from '@solana/web3.js';
import { PublicKey, Connection } from '@solana/web3.js';
import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';
import {
  ProposalEntity,
  ProposalType
} from '@domains/proposals/entities/proposal.entity';
import { UserEntity } from '@domains/users/entities/user.entity';
@Injectable()
export class CreateVoteProposalUseCase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly votingProgramService: VotingProgramService,
    private readonly userService: UserService,
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(
    dto: VoteProposalDto,
    proposalAccountAddress: string,
    userId: string,
    organizationId: string
  ) {
    const proposal = await this.proposalService.findOne({
      where: {
        accountAddress: proposalAccountAddress
      },
      relations: {
        organization: {
          members: { user: true }
        }
      }
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(
        proposal.organization.accountAddress!
      );

    const user = await this.userService.findOne({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const contributors =
      await this.votingProgramService.getOrganizationContributors(
        proposal.organization.accountAddress!
      );

    const contributor = contributors?.find(
      (contributor) => contributor.toBase58() === user.walletAddress
    );

    if (!contributor) {
      throw new ForbiddenException(
        'You are not a contributor of this organization'
      );
    }

    const { instruction } = await this.createTransaction(
      proposal,
      user,
      dto.vote
    );

    const transaction = await this.transactionService.create({
      type:
        proposal.type === ProposalType.CONTRIBUTOR
          ? TransactionType.VOTE_CONTRIBUTOR_PROPOSAL
          : TransactionType.VOTE_PROJECT_PROPOSAL,
      createdBy: user.id,
      request: {
        title: `Vote on ${onChainOrganization.name} ${proposal.type === ProposalType.CONTRIBUTOR ? 'contributor' : 'project'} proposal`,
        description: `Vote on ${onChainOrganization.name} ${proposal.type === ProposalType.CONTRIBUTOR ? 'contributor' : 'project'} proposal`,
        organizationId,
        proposalAccountAddress,
        createdBy: user.id,
        vote: dto.vote
      }
    });

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);
    const connection = new Connection(this.heliusService.devnetRpcUrl);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    return {
      serializedTransaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      transactionId: transaction.id
    };
  }

  private async createTransaction(
    proposal: ProposalEntity,
    user: UserEntity,
    vote: boolean
  ) {
    if (proposal.type === ProposalType.PROJECT) {
      const { instruction } =
        await this.votingProgramService.voteProjectProposal({
          organizationAddress: proposal.organization.accountAddress!,
          proposalAddress: proposal.accountAddress,
          proposerWallet: user.walletAddress,
          vote
        });

      return {
        instruction
      };
    } else {
      const { instruction } = await this.votingProgramService.voteProposal({
        organizationAddress: proposal.organization.accountAddress!,
        proposalAddress: proposal.accountAddress,
        proposerWallet: user.walletAddress,
        vote
      });

      return {
        instruction
      };
    }
  }
}
