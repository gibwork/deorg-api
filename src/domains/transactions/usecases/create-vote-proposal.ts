import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
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
import { Proposal, ProposalType } from '@core/services/voting-program/types';
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
    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(organizationId);

    const user = await this.userService.findOne({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const proposals =
      await this.votingProgramService.getOrganizationProposals(organizationId);

    const proposal = proposals.find(
      (proposal) => proposal.proposalAddress === proposalAccountAddress
    );

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const contributors =
      await this.votingProgramService.getOrganizationContributors(
        organizationId
      );

    const contributor = contributors?.find(
      (contributor) => contributor.toBase58() === user.walletAddress
    );

    if (!contributor) {
      throw new ForbiddenException(
        'You are not a contributor of this organization'
      );
    }

    const { instruction } = await this.createTransaction({
      organizationAddress: organizationId,
      proposalAddress: proposalAccountAddress,
      proposerWallet: user.walletAddress,
      vote: dto.vote,
      type: proposal.type,
      proposal,
      organizationTokenMint: onChainOrganization.tokenMint
    });

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

  private async createTransaction(params: {
    organizationAddress: string;
    proposalAddress: string;
    proposerWallet: string;
    organizationTokenMint: string;
    vote: boolean;
    type: ProposalType;
    proposal: Proposal;
  }) {
    const {
      organizationAddress,
      proposalAddress,
      proposerWallet,
      vote,
      type,
      organizationTokenMint
    } = params;

    if (type === ProposalType.PROJECT) {
      const { instruction } =
        await this.votingProgramService.voteProjectProposal({
          organizationAddress,
          proposalAddress,
          proposerWallet,
          vote,
          organizationTokenMint
        });

      return {
        instruction
      };
    } else if (type === ProposalType.TASK) {
      if (!params.proposal.projectAddress || !params.proposal.assignee) {
        throw new BadRequestException(
          'Project address and assignee are required'
        );
      }

      const { instruction } = await this.votingProgramService.voteTaskProposal({
        projectAddress: params.proposal.projectAddress,
        assignee: params.proposal.assignee,
        organizationAddress,
        proposalAddress,
        proposerWallet,
        vote,
        organizationTokenMint
      });

      return {
        instruction
      };
    } else {
      const { instruction } =
        await this.votingProgramService.voteContributorProposal({
          organizationAddress,
          proposalAddress,
          proposerWallet,
          vote,
          organizationTokenMint
        });

      return {
        instruction
      };
    }
  }
}
