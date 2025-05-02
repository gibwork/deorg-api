import { Injectable } from '@nestjs/common';
import { ProposalRepository } from '../repositories/proposal.repository';
import { ProposalEntity } from '../entities/proposal.entity';
import { Service } from '@core/services/data/service';

@Injectable()
export class ProposalService extends Service<ProposalEntity> {
  constructor(private readonly proposalRepository: ProposalRepository) {
    super({
      repository: proposalRepository,
      entityName: 'Proposal'
    });
  }
}
