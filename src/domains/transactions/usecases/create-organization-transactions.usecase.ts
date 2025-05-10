import { Injectable } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { v4 as uuidv4 } from 'uuid';
import { DepositOrganizationDto } from '../dto/create-organization-transaction.dto';
import { UserEntity } from '@domains/users/entities/user.entity';
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  Transaction
} from '@solana/web3.js';
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

    const { instruction, metadataInstruction, organizationPDA } =
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
        organizationId,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        twitterUrl: dto.twitterUrl,
        discordUrl: dto.discordUrl,
        telegramUrl: dto.telegramUrl,
        description: dto.description
      });

    const { instruction: initTreasuryTokenInstruction } =
      await this.votingProgramService.initTreasuryRegistry(
        organizationPDA.toBase58(),
        user.walletAddress
      );

    const treasuryTokenKeypair = new Keypair();

    const { instruction: registerTreasuryTokenInstruction } =
      await this.votingProgramService.registerTreasuryToken(
        organizationPDA.toBase58(),
        user.walletAddress,
        treasuryTokenKeypair
      );

    const tx = new Transaction();

    // Add all instructions to the transaction
    tx.add(instruction);
    tx.add(metadataInstruction);
    if (initTreasuryTokenInstruction) {
      tx.add(initTreasuryTokenInstruction);
    }
    if (registerTreasuryTokenInstruction) {
      tx.add(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 400000
        })
      );
      tx.add(registerTreasuryTokenInstruction);
    }

    // Set the fee payer and recent blockhash
    tx.feePayer = new PublicKey(user.walletAddress);
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    if (registerTreasuryTokenInstruction) {
      tx.sign(treasuryTokenKeypair);
    }

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
