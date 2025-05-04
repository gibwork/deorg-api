import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { CreateOrganizationTransactionsUsecase } from '../usecases/create-organization-transactions.usecase';
import { AuthGuard } from '@core/guards/auth.guard';
import { UserEntity } from '@domains/users/entities/user.entity';
import { DepositOrganizationDto } from '../dto/create-organization-transaction.dto';
import { UserDecorator } from '@core/decorators/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CreateProposalContributorTransactionUsecase } from '../usecases/create-proposal-contributor-transaction.usecase';
import { CreateProposalContributorTransactionDto } from '../dto/create-proposal-contributor-transaction.dto';
import { VoteProposalDto } from '../dto/vote-proposal.dto';
import { CreateVoteProposalUseCase } from '../usecases/create-vote-proposal';
import { CreateProposalProjectTransactionDto } from '../dto/create-proposal-project-transaction.dto';
import { CreateProposalProjectTransactionUsecase } from '../usecases/create-proposal-project-transaction.usecase';
import { CreateProposalTaskTransactionDto } from '../dto/create-proposal-task-transaction.dto';
import { CreateProposalTaskTransactionsUsecase } from '../usecases/create-proposal-task-transactions.usecase';

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(
    private readonly createOrganizationTransactionsUsecase: CreateOrganizationTransactionsUsecase,
    private readonly createContributorProposalUsecase: CreateProposalContributorTransactionUsecase,
    private readonly createVoteProposalUseCase: CreateVoteProposalUseCase,
    private readonly createProposalProjectTransactionUsecase: CreateProposalProjectTransactionUsecase,
    private readonly createProposalTaskTransactionsUsecase: CreateProposalTaskTransactionsUsecase
  ) {}

  @Post('organization')
  async createOrganization(
    @Body() body: DepositOrganizationDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createOrganizationTransactionsUsecase.execute(body, user);
  }

  @Post('proposals/contributor')
  async createContributorProposal(
    @Body() body: CreateProposalContributorTransactionDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createContributorProposalUsecase.execute(body, user);
  }

  @Post('proposals/:proposalAccountAddress/vote')
  async voteProposal(
    @Body() body: VoteProposalDto,
    @Param('proposalAccountAddress') proposalAccountAddress: string,
    @UserDecorator() user: UserEntity
  ) {
    return this.createVoteProposalUseCase.execute(
      body,
      proposalAccountAddress,
      user.id,
      body.organizationId
    );
  }

  @Post('proposals/projects')
  async createProject(
    @Body() body: CreateProposalProjectTransactionDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createProposalProjectTransactionUsecase.execute(body, user);
  }

  @Post('proposals/tasks')
  async createTask(
    @Body() body: CreateProposalTaskTransactionDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.createProposalTaskTransactionsUsecase.execute(body, user);
  }
}
