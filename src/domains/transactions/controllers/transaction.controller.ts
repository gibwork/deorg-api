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

@Controller('transactions')
@ApiTags('Transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(
    private readonly createOrganizationTransactionsUsecase: CreateOrganizationTransactionsUsecase,
    private readonly createContributorProposalUsecase: CreateProposalContributorTransactionUsecase,
    private readonly createVoteProposalUseCase: CreateVoteProposalUseCase
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

  @Post('proposals/:proposalId/vote')
  async voteProposal(
    @Body() body: VoteProposalDto,
    @Param('proposalId') proposalId: string,
    @UserDecorator() user: UserEntity
  ) {
    return this.createVoteProposalUseCase.execute(
      body,
      proposalId,
      user.id,
      body.organizationId
    );
  }
}
