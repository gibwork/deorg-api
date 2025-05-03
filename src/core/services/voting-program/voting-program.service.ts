import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';
import idl from './gibwork_voting_program.json';
import { GibworkVotingProgram } from './gibwork_voting_program';
import * as anchor from '@coral-xyz/anchor';
import {
  CreateOrganizationDto,
  CreateProjectProposalDto,
  Proposal,
  ProposalType
} from './types';

@Injectable()
export class VotingProgramService {
  PROGRAM_ID = new PublicKey(idl.address);

  constructor(private readonly heliusService: HeliusService) {}

  async createOrganization(dto: CreateOrganizationDto) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    const walletPublicKey = new PublicKey(dto.userPrimaryWallet);

    const uuidBytes = new Uint8Array(16);
    const uuidParts = dto.organizationId.replace(/-/g, '');
    for (let i = 0; i < 16; i++) {
      uuidBytes[i] = parseInt(uuidParts.substring(i * 2, i * 2 + 2), 16);
    }

    const uuidBuffer = Buffer.from(uuidBytes);

    const [organizationPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('organization'), walletPublicKey.toBuffer(), uuidBuffer],
      this.PROGRAM_ID
    );
    console.log('organizationPDA', organizationPDA.toString());

    const [creatorContributorPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor'),
        organizationPDA.toBuffer(),
        walletPublicKey.toBuffer()
      ],
      this.PROGRAM_ID
    );

    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenMint }
    );
    const creatorTokenAccount = tokenAccounts.value[0].pubkey;

    const instruction = program.instruction.createOrganization(
      uuidBytes,
      dto.name,
      dto.contributorProposalThreshold,
      new BN(dto.contributorProposalValidityPeriod * 24 * 60 * 60),
      new BN(dto.contributorValidityPeriod * 24 * 60 * 60),
      dto.contributorProposalQuorumPercentage,
      dto.projectProposalThreshold,
      new BN(dto.projectProposalValidityPeriod * 24 * 60 * 60),
      new BN(dto.minimumTokenRequirement),
      dto.treasuryTransferThresholdPercentage || 70,
      new BN((dto.treasuryTransferProposalValidityPeriod || 14) * 24 * 60 * 60),
      dto.treasuryTransferQuorumPercentage || 40,
      new BN(100),
      {
        accounts: {
          creator: walletPublicKey,
          organization: organizationPDA,
          creatorContributor: creatorContributorPDA,
          tokenMint: tokenMint,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId
        }
      }
    );

    return { instruction, organizationPDA };
  }

  async getOrganizationContributors(
    organizationAccount: string
  ): Promise<PublicKey[]> {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      {
        connection
      }
    );

    const contributors = await program.account.contributor.all([
      {
        memcmp: {
          offset: 8,
          bytes: organizationAccount
        }
      }
    ]);

    return contributors.map((contributor) => contributor.account.authority);
  }

  async getOrganizationDetails(organizationAccount: string) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

    // Create a dummy wallet provider for read-only operations
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs
    } as anchor.Wallet;

    const provider = new anchor.AnchorProvider(connection, dummyWallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });

    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      provider
    );

    const organization = await program.account.organization.fetch(
      new PublicKey(organizationAccount)
    );

    return organization;
  }

  async getOrganizationProposals(
    organizationAccount: string
  ): Promise<Proposal[]> {
    console.log('organizationAccount', organizationAccount);
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

    // Create a dummy wallet provider for read-only operations
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs
    } as anchor.Wallet;

    const provider = new anchor.AnchorProvider(connection, dummyWallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });

    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      provider
    );

    const contributorProposals = await program.account.contributorProposal.all([
      {
        memcmp: {
          offset: 8,
          bytes: organizationAccount
        }
      }
    ]);

    const projectProposals = await program.account.projectProposal.all([
      {
        memcmp: {
          offset: 8,
          bytes: organizationAccount
        }
      }
    ]);

    const proposals = [
      ...contributorProposals.map((proposal) => ({
        type: ProposalType.CONTRIBUTOR,
        proposalAddress: proposal.publicKey.toBase58(),
        organization: proposal.account.organization.toBase58(),
        candidate: proposal.account.candidate.toBase58(),
        proposer: proposal.account.proposer.toBase58(),
        proposedRate: proposal.account.proposedRate.toNumber(),
        createdAt: proposal.account.createdAt.toNumber(),
        expiresAt: proposal.account.expiresAt.toNumber(),
        votesFor: proposal.account.votesFor,
        votesAgainst: proposal.account.votesAgainst,
        status: Object.keys(proposal.account.status)[0],
        votesTotal: proposal.account.votesFor + proposal.account.votesAgainst
      })),
      ...projectProposals.map((proposal) => ({
        type: ProposalType.PROJECT,
        proposalAddress: proposal.publicKey.toBase58(),
        organization: proposal.account.organization.toBase58(),
        candidate: proposal.account.memberPubkeys[0].toBase58(),
        proposer: proposal.account.proposer.toBase58(),
        proposedRate: proposal.account.taskApprovalThreshold,
        createdAt: proposal.account.createdAt.toNumber(),
        expiresAt: proposal.account.expiresAt.toNumber(),
        votesFor: proposal.account.votesFor,
        votesAgainst: proposal.account.votesAgainst,
        status: Object.keys(proposal.account.status)[0],
        votesTotal: proposal.account.votesFor + proposal.account.votesAgainst
      }))
    ];

    return proposals;
  }

  async createContributorProposal(
    organizationAccount: string,
    candidateWallet: string,
    proposerWallet: string
  ) {
    const propoerRate = 100;
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    // Verify they're valid public keys
    const organization = new PublicKey(organizationAccount);
    const candidate = new PublicKey(candidateWallet);
    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    // Find proposer token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

    const proposerTokenAccount = tokenAccounts.value[0].pubkey;

    // Calculate PDA for contributor proposal
    const [proposalPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor_proposal'),
        organization.toBuffer(),
        candidate.toBuffer()
      ],
      this.PROGRAM_ID
    );

    // Calculate PDA for the contributor account that might be created
    const [contributorPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor'),
        organization.toBuffer(),
        candidate.toBuffer()
      ],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.proposeContributor(
      new BN(propoerRate),
      {
        accounts: {
          organization,
          candidate,
          proposerTokenAccount,
          contributor: contributorPDA,
          systemProgram: SystemProgram.programId,
          proposal: proposalPDA,
          proposer: new PublicKey(proposerWallet)
        }
      }
    );

    return {
      instruction,
      proposalPDA
    };
  }

  async voteProposal(params: {
    organizationAddress: string;
    proposalAddress: string;
    vote: boolean;
    proposerWallet: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);
    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(params.proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

    const voterTokenAccount = tokenAccounts.value[0].pubkey;

    // Calculate PDA for the contributor account that will be created/updated
    const [contributorPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor'),
        organization.toBuffer(),
        // Get the candidate pubkey from the proposal account data
        await getProposalCandidateKey(connection, proposal)
      ],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.voteOnContributorProposal(
      new BN(params.vote ? 1 : 0),
      {
        accounts: {
          organization,
          proposal,
          contributor: contributorPDA,
          voterTokenAccount,
          systemProgram: SystemProgram.programId,
          voter: new PublicKey(params.proposerWallet)
        }
      }
    );

    return {
      instruction,
      contributorPDA
    };
  }

  async createProjectProposal(dto: CreateProjectProposalDto) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    const organization = new PublicKey(dto.organizationAddress);

    // Calculate PDA for contributor proposal
    const [proposalPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('project_proposal'),
        organization.toBuffer(),
        Buffer.from(dto.name)
      ],
      this.PROGRAM_ID
    );

    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    // Find proposer token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(dto.proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

    const proposerTokenAccount = tokenAccounts.value[0].pubkey;

    const instruction = program.instruction.proposeProject(
      dto.name,
      dto.members,
      dto.projectProposalThreshold,
      new BN(dto.projectProposalValidityPeriod * 24 * 60 * 60),
      {
        accounts: {
          organization,
          proposal: proposalPDA,
          proposerTokenAccount,
          systemProgram: SystemProgram.programId,
          proposer: new PublicKey(dto.proposerWallet)
        }
      }
    );

    return {
      instruction,
      proposalPDA
    };
  }

  async voteProjectProposal(params: {
    organizationAddress: string;
    proposalAddress: string;
    vote: boolean;
    proposerWallet: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);
    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(params.proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

    const voterTokenAccount = tokenAccounts.value[0].pubkey;

    console.log({
      organization,
      proposal,
      voterTokenAccount,
      systemProgram: SystemProgram.programId,
      voter: new PublicKey(params.proposerWallet)
    });

    const instruction = program.instruction.voteOnProjectProposal(
      new BN(params.vote ? 1 : 0),
      {
        accounts: {
          organization,
          proposal,
          voterTokenAccount,
          systemProgram: SystemProgram.programId,
          voter: new PublicKey(params.proposerWallet)
        }
      }
    );

    return {
      instruction
    };
  }
}

/**
 * Get the candidate public key from a proposal account
 */
async function getProposalCandidateKey(
  connection: Connection,
  proposalPubkey: PublicKey
): Promise<Buffer> {
  // Fetch the proposal account data
  const proposalAccount = await connection.getAccountInfo(proposalPubkey);

  if (!proposalAccount) {
    throw new Error('Proposal account not found');
  }

  // Skip the 8-byte discriminator
  const dataBuffer = proposalAccount.data.slice(8);

  // Candidate address is at offset 32-64 (after organization pubkey)
  return dataBuffer.slice(32, 64);
}
