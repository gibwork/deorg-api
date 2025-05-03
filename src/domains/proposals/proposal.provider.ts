import { ModuleMetadata } from '@nestjs/common';
import { ProposalRepository } from './repositories/proposal.repository';
import { ProposalService } from './services/proposal.service';
import { ProposalsController } from './controllers/proposals.controller';
import { ListProposalsUsecase } from './usecases/list-proposals.usecase';
import { CreateContributorProposalUsecase } from './usecases/create-contributor-proposal.usecase';
import { VoteProposalUsecase } from './usecases/vote-proposa.usecase';

export const ProposalsProvider: ModuleMetadata = {
  controllers: [ProposalsController],
  providers: [
    ProposalRepository,
    ProposalService,
    ListProposalsUsecase,
    CreateContributorProposalUsecase,
    VoteProposalUsecase
  ]
};
