import { Injectable } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { v4 as uuidv4 } from 'uuid';
import { DepositOrganizationDto } from '../dto/create-organization-transaction.dto';
import { UserEntity } from '@domains/users/entities/user.entity';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionType } from '../entities/transaction.entity';
import { Deorg } from '@deorg/node';

@Injectable()
export class CreateOrganizationTransactionsUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(dto: DepositOrganizationDto, user: UserEntity) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const organizationId = uuidv4();

    const { transaction: tx, organizationPDA } =
      await deorg.createOrganizationTransaction({
        tokenMint: dto.token.mintAddress,
        name: dto.name,
        contributorProposalThreshold: dto.contributorProposalThreshold,
        contributorProposalValidityPeriod:
          dto.contributorProposalValidityPeriod,
        contributorValidityPeriod: dto.contributorValidityPeriod,
        contributorProposalQuorumPercentage:
          dto.contributorProposalQuorumPercentage,
        projectProposalValidityPeriod: dto.projectProposalValidityPeriod,
        projectProposalThreshold: dto.projectProposalThreshold,
        minimumTokenRequirement: dto.minimumTokenRequirement,
        treasuryTransferThresholdPercentage:
          dto.treasuryTransferThresholdPercentage,
        treasuryTransferProposalValidityPeriod:
          dto.treasuryTransferProposalValidityPeriod,
        treasuryTransferQuorumPercentage: dto.treasuryTransferQuorumPercentage,
        creatorWallet: user.walletAddress,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        twitterUrl: dto.twitterUrl,
        discordUrl: dto.discordUrl,
        telegramUrl: dto.telegramUrl,
        description: dto.description,
        organizationId
      });

    const transaction = await this.transactionService.create({
      type: TransactionType.CREATE_ORGANIZATION,
      createdBy: user.id,
      request: {
        organizationPda: organizationPDA.toBase58(),
        organizationId,
        ...dto
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
