import { CreateProposalProjectTransactionDto } from '../dto/create-proposal-project-transaction.dto';
import { PublicKey } from '@solana/web3.js';
import { UserEntity } from '@domains/users/entities/user.entity';
import { HeliusService } from '@core/services/helius/helius.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';
import { TransactionService } from '../services/transaction.service';
import { v4 as uuidv4 } from 'uuid';
import { Deorg } from '@deorg/node';
@Injectable()
export class CreateProposalProjectTransactionUsecase {
  constructor(
    private readonly heliusService: HeliusService,
    private readonly transactionService: TransactionService
  ) {}

  async execute(dto: CreateProposalProjectTransactionDto, user: UserEntity) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization = await deorg.getOrganizationDetails(
      dto.organizationId
    );

    if (!onChainOrganization.contributors.includes(user.walletAddress)) {
      throw new BadRequestException('User is not a contributor');
    }

    const members = dto.members.map((member) => new PublicKey(member));

    // validate if all members are contributors
    const allMembersAreContributors = dto.members.every((member) =>
      onChainOrganization.contributors.includes(member)
    );

    if (!allMembersAreContributors) {
      throw new BadRequestException('All members must be contributors');
    }

    const projectId = uuidv4();

    const { transaction: tx, proposalPDA } =
      await deorg.createProjectProposalTransaction({
        id: projectId,
        name: dto.name,
        description: dto.description,
        members,
        organizationAddress: onChainOrganization.accountAddress,
        projectProposalThreshold: dto.projectProposalThreshold,
        projectProposalValidityPeriod: dto.projectProposalValidityPeriod,
        proposerWallet: user.walletAddress
      });

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

    return {
      serializedTransaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      transactionId: transaction.id
    };
  }
}
