import { ModuleMetadata } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { CreateOrganizationTransactionsUsecase } from './usecases/create-organization-transactions.usecase';
import { TransactionRepository } from './repositories/transaction.repository';
import { CreateProposalContributorTransactionUsecase } from './usecases/create-proposal-contributor-transaction.usecase';
import { CreateVoteProposalUseCase } from './usecases/create-vote-proposal';

export const TransactionsProvider: ModuleMetadata = {
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    CreateOrganizationTransactionsUsecase,
    CreateProposalContributorTransactionUsecase,
    CreateVoteProposalUseCase
  ]
};
