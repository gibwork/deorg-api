import { Injectable } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { v4 as uuidv4 } from 'uuid';
import { DepositOrganizationDto } from '../dto/create-organization-transaction.dto';
import { UserEntity } from '@domains/users/entities/user.entity';
import { Connection, Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { TransactionType } from '../entities/transaction.entity';

@Injectable()
export class CreateOrganizationTransactionsUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(dto: DepositOrganizationDto, user: UserEntity) {
    const connection = new Connection(this.heliusService.devnetRpcUrl);

    const organizationId = uuidv4();

    const { instruction, organizationPDA } =
      await this.votingProgramService.createOrganization({
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
        userPrimaryWallet: user.walletAddress,
        organizationId
      });

    const tx = new Transaction().add(instruction);
    tx.feePayer = new PublicKey(user.walletAddress);

    const transaction = await this.transactionService.create({
      type: TransactionType.CREATE_ORGANIZATION,
      createdBy: user.id,
      request: {
        organizationPda: organizationPDA.toBase58(),
        organizationId,
        ...dto
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
