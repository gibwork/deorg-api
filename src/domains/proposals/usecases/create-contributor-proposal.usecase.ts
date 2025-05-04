import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection, Transaction } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { UserService } from '@domains/users/services/user.service';
import { ClerkService } from '@core/services/clerk/clerk.service';
import { OrganizationRole } from '@domains/organizations/entities/organization-member.entity';
import { OrganizationMemberService } from '@domains/organizations/services/organization-member.service';
import { ProposalType } from '@domains/proposals/entities/proposal.entity';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
@Injectable()
export class CreateContributorProposalUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService,
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
    private readonly organizationMemberService: OrganizationMemberService,
    private readonly votingProgramService: VotingProgramService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(organizationId: string, dto: CreateContributorProposalDto) {
    const organization = await this.organizationService.findOne({
      where: {
        id: organizationId
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const onChainOrganization =
      await this.votingProgramService.getOrganizationDetails(
        organization.accountAddress
      );

    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId
      }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

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

    const proposal = await this.proposalService.create({
      organizationId,
      title: `Propose ${transaction.request['candidateWallet']} as a contributor`,
      description: `Propose ${transaction.request['candidateWallet']} as a contributor to the organization ${onChainOrganization.name}`,
      accountAddress: transaction.request['proposalPDA'],
      createdBy: transaction.createdBy,
      type: ProposalType.CONTRIBUTOR
    });

    const userWallet = transaction.request['candidateWallet'];

    let user = await this.userService.findOne({
      where: {
        walletAddress: userWallet
      }
    });

    if (!user) {
      const existingUser = await this.clerkService.findUserByUsername(
        userWallet.slice(0, 6).toLowerCase()
      );

      if (existingUser) {
        user = await this.userService.create({
          externalId: existingUser.id,
          walletAddress: userWallet,
          username: existingUser.username!,
          profilePicture: existingUser.image_url
        });
      } else {
        const newUser = await this.clerkService.createUser(
          userWallet.toLowerCase()
        );

        user = await this.userService.create({
          externalId: newUser.id,
          walletAddress: userWallet,
          username: newUser.username!,
          profilePicture: newUser.imageUrl
        });
      }
    }

    const member = await this.organizationMemberService.findOne({
      where: {
        organizationId,
        userId: user.id
      }
    });

    if (!member) {
      await this.organizationMemberService.create({
        organizationId,
        userId: user.id,
        role: OrganizationRole.MEMBER
      });
    }

    return proposal;
  }
}
