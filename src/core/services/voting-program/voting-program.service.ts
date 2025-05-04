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

    const proposalKeyBuffer = proposal.toBuffer();
    const projectUuid = proposalKeyBuffer.slice(0, 16);

    // Find the expected PDA for the project
    const [projectPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('project'), organization.toBuffer(), projectUuid],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.voteOnProjectProposal(
      new BN(params.vote ? 1 : 0),
      {
        accounts: {
          organization,
          proposal,
          voterTokenAccount,
          systemProgram: SystemProgram.programId,
          voter: new PublicKey(params.proposerWallet),
          project: projectPDA,
          rent: new PublicKey('SysvarRent111111111111111111111111111111111')
        }
      }
    );

    return {
      instruction
    };
  }

  async getOrganizationProjects(organizationAddress: string) {
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

    const projects = await program.account.project.all([
      {
        memcmp: {
          offset: 8,
          bytes: organizationAddress
        }
      }
    ]);

    return projects.map((project) => ({
      accountAddress: project.publicKey.toBase58(),
      organization: project.account.organization.toBase58(),
      uuid: project.account.uuid,
      title: project.account.title,
      members: project.account.members.map((member) => member.toBase58()),
      taskApprovalThreshold: project.account.taskApprovalThreshold,
      validityEndTime: project.account.validityEndTime.toNumber(),
      isActive: project.account.isActive
    }));
  }

  async getProjectDetails(projectAccountAddress: string) {
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

    const project = await program.account.project.fetch(
      new PublicKey(projectAccountAddress)
    );

    return project;
  }

  async createTaskProposal(dto: {
    projectAddress: string;
    title: string;
    paymentAmount: number;
    assignee: string;
    description: string; // New parameter for description
    organizationAddress: string; // Organization address
    userPrimaryWallet: string;
    nonce?: number; // Optional nonce for unique PDA derivation
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<GibworkVotingProgram>(
      idl as GibworkVotingProgram,
      connection
    );

    // Verify they're valid public keys
    const project = new PublicKey(dto.projectAddress);
    const assignee = new PublicKey(dto.assignee);
    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );
    const organization = new PublicKey(dto.organizationAddress);

    const nonce = dto.nonce || Math.floor(Date.now() / 1000);

    const [taskPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('task'), project.toBuffer(), Buffer.from(dto.title)],
      this.PROGRAM_ID
    );

    console.log(`Task PDA: ${taskPDA.toString()}`);

    // Find treasury registry PDA
    const [tokenRegistryPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_registry'), organization.toBuffer()],
      this.PROGRAM_ID
    );

    // Find treasury authority PDA
    const [treasuryAuthorityPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_authority'), organization.toBuffer()],
      this.PROGRAM_ID
    );

    // Find treasury token account for the specified mint
    const treasuryTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(treasuryAuthorityPDA, {
        mint: tokenMint
      });

    if (treasuryTokenAccounts.value.length === 0) {
      throw new Error('No treasury token account found for the specified mint');
    }

    const treasuryTokenAccount = treasuryTokenAccounts.value[0].pubkey;

    // Find destination token account for the assignee
    const destinationTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(assignee, {
        mint: tokenMint
      });

    if (destinationTokenAccounts.value.length === 0) {
      throw new Error(
        'No token account found for the assignee for the specified mint'
      );
    }

    const destinationTokenAccount = destinationTokenAccounts.value[0].pubkey;

    const organizationAccount = await connection.getAccountInfo(organization);
    if (!organizationAccount) {
      throw new Error('Organization account not found');
    }

    const organizationDetails = await this.getOrganizationDetails(
      organization.toBase58()
    );

    console.log(
      'Organization token mint:',
      organizationDetails.tokenMint.toString()
    );

    // Find creator's token account for the organization token
    const creatorTokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(dto.userPrimaryWallet),
      { mint: organizationDetails.tokenMint }
    );

    if (!creatorTokenAccounts || creatorTokenAccounts.value.length === 0) {
      throw new Error(
        'No token account found for the creator for the governance token'
      );
    }

    const creatorTokenAccount = creatorTokenAccounts.value[0].pubkey;

    // Calculate PDA for transfer proposal
    // Get token decimals from mint account
    const tokenMintInfo = await connection.getAccountInfo(tokenMint);

    // Try to get token decimals - default to 9 if not available
    let tokenDecimals = 9;
    try {
      // SPL token mints store decimals at offset 44
      if (tokenMintInfo && tokenMintInfo.data.length >= 45) {
        tokenDecimals = tokenMintInfo.data[44];
      }
      console.log(`Token decimal places: ${tokenDecimals}`);
    } catch (err) {
      console.log('Could not determine token decimals, using default of 9');
    }

    const paymentAmountTokenUnits = Math.floor(
      dto.paymentAmount * Math.pow(10, tokenDecimals)
    );

    console.log(
      `Converting payment: ${dto.paymentAmount} → ${paymentAmountTokenUnits} raw units (${tokenDecimals} decimals)`
    );

    console.log(`Treasury token account: ${treasuryTokenAccount.toString()}`);
    const treasuryTokenAccountInfo =
      await connection.getTokenAccountBalance(treasuryTokenAccount);
    console.log(
      `Treasury balance: ${treasuryTokenAccountInfo.value.amount} raw units (${treasuryTokenAccountInfo.value.decimals} decimals)`
    );
    console.log(
      `Treasury balance (UI): ${treasuryTokenAccountInfo.value.uiAmount}`
    );

    const paymentAmountBN = new BN(paymentAmountTokenUnits);

    const [transferProposalPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('treasury_transfer'),
        organization.toBuffer(),
        tokenMint.toBuffer(),
        Buffer.from(paymentAmountBN.toArray('le', 8)),
        new PublicKey(dto.userPrimaryWallet).toBuffer(),
        Buffer.from(new BN(nonce).toArray('le', 8))
      ],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.createTask(
      dto.title,
      new BN(paymentAmountTokenUnits),
      assignee,
      dto.description,
      tokenMint,
      new BN(nonce),
      {
        accounts: {
          creator: new PublicKey(dto.userPrimaryWallet),
          organization,
          project,
          task: taskPDA,
          tokenRegistry: tokenRegistryPDA,
          transferProposal: transferProposalPDA,
          treasuryTokenAccount: treasuryTokenAccount,
          treasuryAuthority: treasuryAuthorityPDA,
          destinationTokenAccount: destinationTokenAccount,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId
        }
      }
    );

    return {
      instruction,
      taskPDA
    };
  }

  async getTasks(projectAddress: string) {
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

    const tasks = await program.account.task.all([
      {
        memcmp: {
          offset: 8,
          bytes: projectAddress
        }
      }
    ]);

    return tasks.map((task) => ({
      project: task.account.project.toBase58(),
      title: task.account.title,
      paymentAmount: task.account.paymentAmount.toNumber(),
      assignee: task.account.assignee.toBase58(),
      votesFor: task.account.votesFor,
      votesAgainst: task.account.votesAgainst,
      status: Object.keys(task.account.status)[0],
      voters: task.account.voters.map((voter) => voter.toBase58()),
      transferProposal: task.account.transferProposal?.toBase58(),
      vault: task.account.vault?.toBase58()
    }));
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
