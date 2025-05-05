import { PublicKey } from '@solana/web3.js';

export enum ProposalType {
  CONTRIBUTOR = 'CONTRIBUTOR',
  PROJECT = 'PROJECT',
  TASK = 'TASK'
}

export type Proposal = {
  type: ProposalType;
  proposalAddress: string;
  organization: string;
  candidate: string;
  proposer: string;
  proposedRate: number;
  createdAt: number;
  expiresAt: number;
  votesFor: number;
  votesAgainst: number;
  status: any;
  votesTotal: number;
};

export type CreateOrganizationDto = {
  name: string;
  contributorProposalThreshold: number;
  contributorProposalValidityPeriod: number;
  contributorValidityPeriod: number;
  contributorProposalQuorumPercentage: number;
  projectProposalThreshold: number;
  projectProposalValidityPeriod: number;
  minimumTokenRequirement: number;
  treasuryTransferThresholdPercentage?: number;
  treasuryTransferProposalValidityPeriod?: number;
  treasuryTransferQuorumPercentage?: number;
  userPrimaryWallet: string;
  organizationId: string;
};

export type CreateProjectProposalDto = {
  id: string;
  name: string;
  members: PublicKey[];
  organizationAddress: string;
  projectProposalThreshold: number;
  projectProposalValidityPeriod: number;
  proposerWallet: string;
};
