import { Injectable } from '@nestjs/common';
import { ProposalEntity } from '../entities/proposal.entity';
import { Repository } from '@core/repositories/repository';

@Injectable()
export class ProposalRepository extends Repository<ProposalEntity> {
  constructor() {
    super(ProposalEntity);
  }

  getEntity(parameters: Partial<ProposalEntity>): ProposalEntity {
    return new ProposalEntity(parameters);
  }
}
