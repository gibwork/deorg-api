import { UserEntity } from '@domains/users/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProposalContributorTransactionDto } from '../dto/create-proposal-contributor-transaction.dto';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../entities/transaction.entity';
import { HeliusService } from '@core/services/helius/helius.service';
import { Deorg } from '@deorg/node';

@Injectable()
export class CreateProposalContributorTransactionUsecase {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  async execute(
    dto: CreateProposalContributorTransactionDto,
    user: UserEntity
  ) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const onChainOrganization = await deorg.getOrganizationDetails(
      dto.organizationId
    );

    if (onChainOrganization.contributors.includes(dto.candidateWallet)) {
      throw new BadRequestException('Candidate is already a contributor');
    }

    const { transaction: tx, proposalPDA } =
      await deorg.createContributorProposalTransaction({
        organizationAccount: onChainOrganization.accountAddress,
        candidateWallet: dto.candidateWallet,
        proposerWallet: user.walletAddress,
        proposedRate: dto.proposedRate,
        tokenMint: onChainOrganization.treasuryBalances[0].mint
      });

    const transaction = await this.transactionService.create({
      createdBy: user.id,
      type: TransactionType.PROPOSAL_CONTRIBUTOR,
      request: {
        organizationId: dto.organizationId,
        candidateWallet: dto.candidateWallet,
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
