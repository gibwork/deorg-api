import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { UserService } from '@domains/users/services/user.service';
import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';
import { Deorg } from '@deorg/node';
import { ProposalType } from '@deorg/node/dist/types';

@Injectable()
export class CreateVoteProposalUseCase {
  constructor(
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
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization =
      await deorg.getOrganizationDetails(organizationId);

    const user = await this.userService.findOne({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const proposals = await deorg.getOrganizationProposals(organizationId);

    const proposal = proposals.find(
      (proposal) => proposal.proposalAddress === proposalAccountAddress
    );

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const contributor = onChainOrganization.contributors.find(
      (contributor) => contributor === user.walletAddress
    );

    if (!contributor) {
      throw new ForbiddenException(
        'You are not a contributor of this organization'
      );
    }

    const { transaction: tx } = await this.createTransaction({
      organizationAddress: organizationId,
      proposalAddress: proposalAccountAddress,
      proposerWallet: user.walletAddress,
      vote: dto.vote,
      type: proposal.type,
      tokenMint: onChainOrganization.treasuryBalances[0].mint,
      proposal,
      deorg
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
    vote: boolean;
    type: ProposalType;
    proposal: any;
    deorg: Deorg;
    tokenMint: string;
  }) {
    const { organizationAddress, proposalAddress, proposerWallet, vote, type } =
      params;

    if (type === ProposalType.PROJECT) {
      const { transaction } = await params.deorg.voteProjectProposalTransaction(
        {
          organizationAddress,
          proposalAddress,
          proposerWallet,
          vote
        }
      );

      return {
        transaction
      };
    } else if (type === ProposalType.TASK) {
      if (!params.proposal.projectAddress || !params.proposal.assignee) {
        throw new BadRequestException(
          'Project address and assignee are required'
        );
      }

      const { transaction } = await params.deorg.voteTaskProposalTransaction({
        projectAddress: params.proposal.projectAddress,
        assignee: params.proposal.assignee,
        organizationAddress,
        proposalAddress,
        proposerWallet,
        vote
      });

      return {
        transaction
      };
    } else {
      const { transaction } =
        await params.deorg.voteContributorProposalTransaction({
          organizationAddress,
          proposalAddress,
          proposerWallet,
          vote,
          tokenMint: params.tokenMint
        });

      return {
        transaction
      };
    }
  }
}
