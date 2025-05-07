import { ModuleMetadata } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';
import { CreateOrganizationTransactionsUsecase } from './usecases/create-organization-transactions.usecase';
import { TransactionRepository } from './repositories/transaction.repository';
import { CreateProposalContributorTransactionUsecase } from './usecases/create-proposal-contributor-transaction.usecase';
import { CreateVoteProposalUseCase } from './usecases/create-vote-proposal';
import { CreateProposalProjectTransactionUsecase } from './usecases/create-proposal-project-transaction.usecase';
import { CreateProposalTaskTransactionsUsecase } from './usecases/create-proposal-task-transactions.usecase';
import { CompleteTaskTransactionUsecase } from './usecases/complete-task-transaction.usecase';
import { EnableTaskWithdrawTransactionUsecase } from './usecases/enable-task-withdraw-transaction.usecase';
import { WithdrawTaskTransactionUsecase } from './usecases/withdraw-task-transaction.usecase';
export const TransactionsProvider: ModuleMetadata = {
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionRepository,
    CreateOrganizationTransactionsUsecase,
    CreateProposalContributorTransactionUsecase,
    CreateVoteProposalUseCase,
    CreateProposalProjectTransactionUsecase,
    CreateProposalTaskTransactionsUsecase,
    CompleteTaskTransactionUsecase,
    EnableTaskWithdrawTransactionUsecase,
    WithdrawTaskTransactionUsecase
  ]
};
