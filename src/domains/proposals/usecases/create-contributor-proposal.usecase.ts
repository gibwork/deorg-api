import { Injectable, NotFoundException } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { CreateContributorProposalDto } from '../dto/create-contributor-proposal.dto';
import { OrganizationService } from '@domains/organizations/services/organization.service';
import { TransactionService } from '@domains/transactions/services/transaction.service';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { UserService } from '@domains/users/services/user.service';
import { ClerkService } from '@core/services/clerk/clerk.service';
import { OrganizationRole } from '@domains/organizations/entities/organization-member.entity';
import { OrganizationMemberService } from '@domains/organizations/services/organization-member.service';
import { ProposalType } from '@domains/proposals/entities/proposal.entity';
import { sendTransaction } from '@utils/sendTransaction';
import { Deorg } from '@deorg/node';

@Injectable()
export class CreateContributorProposalUsecase {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService,
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
    private readonly organizationMemberService: OrganizationMemberService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(orgAccountAddress: string, dto: CreateContributorProposalDto) {
    const organization = await this.organizationService.findOne({
      where: {
        accountAddress: orgAccountAddress
      }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization = await deorg.getOrganizationDetails(
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

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    const proposal = await this.proposalService.create({
      organizationId: organization.id,
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
        organizationId: organization.id,
        userId: user.id
      }
    });

    if (!member) {
      await this.organizationMemberService.create({
        organizationId: organization.id,
        userId: user.id,
        role: OrganizationRole.MEMBER
      });
    }

    return proposal;
  }
}
