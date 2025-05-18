import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';
import idl from './deorg_voting_program.json';
import { DeorgVotingProgram } from './deorg_voting_program';
import * as anchor from '@coral-xyz/anchor';
import {
  CreateOrganizationDto,
  CreateProjectProposalDto,
  Proposal,
  ProposalType
} from './types';
import { convertUuid } from '@utils/convertUuid';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

@Injectable()
export class VotingProgramService {
  PROGRAM_ID = new PublicKey(idl.address);

  constructor(private readonly heliusService: HeliusService) {}

  async initTreasuryRegistry(organizationAddress: string, authority: string) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const organization = new PublicKey(organizationAddress);

    // Calculate PDA for the treasury registry
    const [treasuryRegistryPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_registry'), organization.toBuffer()],
      this.PROGRAM_ID
    );

    const treasuryRegistryAccount =
      await connection.getAccountInfo(treasuryRegistryPDA);

    if (treasuryRegistryAccount) {
      return {
        instruction: null,
        treasuryRegistryPDA: treasuryRegistryPDA.toString()
      };
    }

    const instruction = program.instruction.initializeTreasuryRegistry({
      accounts: {
        authority: new PublicKey(authority),
        organization,
        tokenRegistry: treasuryRegistryPDA,
        systemProgram: SystemProgram.programId
      }
    });

    return { instruction, treasuryRegistryPDA: treasuryRegistryPDA.toString() };
  }

  async registerTreasuryToken(
    organizationAddress: string,
    authority: string,
    treasuryTokenKeypair: Keypair,
    token: string
  ) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const organization = new PublicKey(organizationAddress);
    const tokenMint = new PublicKey(token);

    // Calculate PDA for the treasury registry
    const [treasuryRegistryPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_registry'), organization.toBuffer()],
      this.PROGRAM_ID
    );

    // Calculate treasury authority PDA (needed by executeFundsTransfer)
    // This is required for creating a reference to the authority for
    // the transaction instruction and token account operations
    const treasuryAuthoritySeed = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_authority'), organization.toBuffer()],
      this.PROGRAM_ID
    );
    const _treasuryAuthorityPDA = treasuryAuthoritySeed[0];

    // Check if a token account for this mint already exists
    const existingTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(_treasuryAuthorityPDA, {
        mint: tokenMint
      });

    if (existingTokenAccounts.value.length > 0) {
      return {
        instruction: null,
        treasuryTokenAccount: existingTokenAccounts.value[0].pubkey.toString(),
        treasuryTokenKeypair: null
      };
    }

    // Calculate PDA for the treasury token account
    const [treasuryTokenAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('treasury_token_account'), organization.toBuffer()],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.registerTreasuryToken({
      accounts: {
        authority: new PublicKey(authority).toString(),
        organization: organization.toString(),
        treasuryTokenAccount: treasuryTokenKeypair.publicKey.toString(),
        tokenMint: tokenMint.toString(),
        treasuryAuthority: _treasuryAuthorityPDA.toString(),
        tokenRegistry: treasuryRegistryPDA.toString(),
        systemProgram: SystemProgram.programId.toString(),
        tokenProgram: TOKEN_PROGRAM_ID.toString(),
        rent: SYSVAR_RENT_PUBKEY.toString()
      }
    });

    return {
      instruction,
      treasuryTokenAccount: treasuryTokenAccountPDA.toString(),
      treasuryTokenKeypair: null
    };
  }

  async createOrganization(dto: CreateOrganizationDto) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
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

    const [creatorContributorPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor'),
        organizationPDA.toBuffer(),
        walletPublicKey.toBuffer()
      ],
      this.PROGRAM_ID
    );

    const tokenMint = new PublicKey(dto.tokenMint);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenMint }
    );
    const creatorTokenAccount = tokenAccounts.value[0].pubkey;

    const [orgMetadataPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('metadata'), organizationPDA.toBuffer()],
      this.PROGRAM_ID
    );

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

    const metadataInstruction =
      program.instruction.initializeOrganizationMetadata(
        dto.logoUrl || null,
        dto.websiteUrl || null,
        dto.twitterUrl || null,
        dto.discordUrl || null,
        dto.telegramUrl || null,
        dto.description || null,
        {
          accounts: {
            creator: walletPublicKey,
            organization: organizationPDA,
            metadata: orgMetadataPDA,
            systemProgram: SystemProgram.programId
          }
        }
      );

    return { instruction, metadataInstruction, organizationPDA };
  }

  async getOrganizationContributors(
    organizationAccount: string
  ): Promise<PublicKey[]> {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
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

  async getOrganizations() {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      {
        connection
      }
    );

    const organizations = await program.account.organization.all([]);

    const metadata = await program.account.organizationMetadata.all([]);

    const organizationsData = organizations.map((organization) => {
      const meta = metadata.find(
        (m) =>
          m.account.organization.toBase58() ===
          organization.publicKey.toBase58()
      );

      return {
        ...organization,
        metadata: {
          logoUrl: meta?.account.logoUrl,
          websiteUrl: meta?.account.websiteUrl,
          twitterUrl: meta?.account.twitterUrl,
          discordUrl: meta?.account.discordUrl,
          telegramUrl: meta?.account.telegramUrl,
          description: meta?.account.description
        }
      };
    });

    return organizationsData.map((organization) => ({
      accountAddress: organization.publicKey.toBase58(),
      creator: organization.account.creator.toBase58(),
      uuid: convertUuid(organization.account.uuid),
      name: organization.account.name,
      contributors: organization.account.contributors.map((contributor) =>
        contributor.toBase58()
      ),
      contributorProposalThresholdPercentage:
        organization.account.contributorProposalThresholdPercentage,
      contributorProposalValidityPeriod:
        organization.account.contributorProposalValidityPeriod.toNumber(),
      treasuryTransferQuorumPercentage:
        organization.account.treasuryTransferQuorumPercentage,
      tokenMint: organization.account.tokenMint.toBase58(),
      treasuryTransferThresholdPercentage:
        organization.account.treasuryTransferThresholdPercentage,
      treasuryTransferProposalValidityPeriod:
        organization.account.treasuryTransferProposalValidityPeriod.toNumber(),
      minimumTokenRequirement:
        organization.account.minimumTokenRequirement.toNumber(),
      contributorValidityPeriod:
        organization.account.contributorValidityPeriod.toNumber(),
      projectProposalValidityPeriod:
        organization.account.projectProposalValidityPeriod.toNumber(),
      contributorProposalQuorumPercentage:
        organization.account.contributorProposalQuorumPercentage,
      projectProposalThresholdPercentage:
        organization.account.projectProposalThresholdPercentage,
      metadata: organization.metadata
    }));
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    const organization = await program.account.organization.fetch(
      new PublicKey(organizationAccount)
    );

    const treasuryTokenRegistry =
      await program.account.treasuryTokenRegistry.all([
        {
          memcmp: {
            offset: 8,
            bytes: organizationAccount
          }
        }
      ]);

    const treasuryBalances: {
      tokenAccount: string;
      mint: string;
      raw: number;
      ui: number;
      decimals: number;
    }[] = [];
    for (const tokenAccount of treasuryTokenRegistry[0].account.tokenAccounts) {
      if (tokenAccount.tokenAccount) {
        const treasuryTokenAccountAmount =
          await connection.getTokenAccountBalance(tokenAccount.tokenAccount);

        treasuryBalances.push({
          tokenAccount: tokenAccount.tokenAccount.toBase58(),
          mint: tokenAccount.mint.toBase58(),
          raw: treasuryTokenAccountAmount.value.amount,
          ui: treasuryTokenAccountAmount.value.uiAmount,
          decimals: treasuryTokenAccountAmount.value.decimals
        });
      }
    }

    let orgmetadata: any = {};
    try {
      const result = await program.account.organizationMetadata.all([
        {
          memcmp: {
            offset: 8,
            bytes: organizationAccount
          }
        }
      ]);

      orgmetadata = {
        logoUrl: result[0].account.logoUrl,
        websiteUrl: result[0].account.websiteUrl,
        twitterUrl: result[0].account.twitterUrl,
        discordUrl: result[0].account.discordUrl,
        telegramUrl: result[0].account.telegramUrl,
        description: result[0].account.description
      };
    } catch (error) {
      console.error('Error fetching organization metadata', error);
    }

    return {
      accountAddress: organizationAccount,
      creator: organization.creator.toBase58(),
      uuid: convertUuid(organization.uuid),
      name: organization.name,
      contributors: organization.contributors.map((contributor) =>
        contributor.toBase58()
      ),
      contributorProposalThresholdPercentage:
        organization.contributorProposalThresholdPercentage,
      contributorProposalValidityPeriod:
        organization.contributorProposalValidityPeriod.toNumber(),
      treasuryTransferQuorumPercentage:
        organization.treasuryTransferQuorumPercentage,
      tokenMint: organization.tokenMint.toBase58(),
      treasuryTransferThresholdPercentage:
        organization.treasuryTransferThresholdPercentage,
      treasuryTransferProposalValidityPeriod:
        organization.treasuryTransferProposalValidityPeriod.toNumber(),
      minimumTokenRequirement: organization.minimumTokenRequirement.toNumber(),
      contributorValidityPeriod:
        organization.contributorValidityPeriod.toNumber(),
      projectProposalValidityPeriod:
        organization.projectProposalValidityPeriod.toNumber(),
      contributorProposalQuorumPercentage:
        organization.contributorProposalQuorumPercentage,
      projectProposalThresholdPercentage:
        organization.projectProposalThresholdPercentage,
      treasuryBalances,
      metadata: orgmetadata
    };
  }

  async getOrganizationProposals(
    organizationAccount: string
  ): Promise<Proposal[]> {
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
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

    const taskProposals = await program.account.taskProposal.all([
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
        voters: proposal.account.voters.map((voter) => voter.toBase58()),
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
        voters: proposal.account.voters.map((voter) => voter.toBase58()),
        votesFor: proposal.account.votesFor,
        votesAgainst: proposal.account.votesAgainst,
        status: Object.keys(proposal.account.status)[0],
        votesTotal: proposal.account.votesFor + proposal.account.votesAgainst
      })),
      ...taskProposals.map((proposal) => ({
        type: ProposalType.TASK,
        proposalAddress: proposal.publicKey.toBase58(),
        organization: proposal.account.organization.toBase58(),
        candidate: proposal.account.assignee.toBase58(),
        proposer: proposal.account.proposer.toBase58(),
        proposedRate: proposal.account.paymentAmount.toNumber(),
        createdAt: proposal.account.createdAt.toNumber(),
        expiresAt: proposal.account.expiresAt.toNumber(),
        voters: proposal.account.voters.map((voter) => voter.toBase58()),
        votesFor: proposal.account.votesFor,
        votesAgainst: proposal.account.votesAgainst,
        status: Object.keys(proposal.account.status)[0],
        votesTotal: proposal.account.votesFor + proposal.account.votesAgainst,
        amount: proposal.account.paymentAmount.toNumber(),
        project: proposal.account.project.toBase58(),
        title: proposal.account.title,
        projectAddress: proposal.account.project.toBase58(),
        assignee: proposal.account.assignee.toBase58()
      }))
    ];

    return proposals;
  }

  async createContributorProposal(dto: {
    organizationAccount: string;
    candidateWallet: string;
    proposerWallet: string;
    proposedRate: number;
    token: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    // Verify they're valid public keys
    const organization = new PublicKey(dto.organizationAccount);
    const candidate = new PublicKey(dto.candidateWallet);
    const tokenMint = new PublicKey(dto.token);

    // Find proposer token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(dto.proposerWallet),
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
      new BN(dto.proposedRate),
      {
        accounts: {
          organization,
          candidate,
          proposerTokenAccount,
          contributor: contributorPDA,
          systemProgram: SystemProgram.programId,
          proposal: proposalPDA,
          proposer: new PublicKey(dto.proposerWallet)
        }
      }
    );

    return {
      instruction,
      proposalPDA
    };
  }

  async voteContributorProposal(params: {
    organizationAddress: string;
    proposalAddress: string;
    vote: boolean;
    proposerWallet: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const onChainOrganization = await this.getOrganizationDetails(
      params.organizationAddress
    );

    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);
    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
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
      params.vote,
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

  async voteTaskProposal(params: {
    organizationAddress: string;
    proposalAddress: string;
    vote: boolean;
    proposerWallet: string;
    projectAddress: string;
    assignee: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const onChainOrganization = await this.getOrganizationDetails(
      params.organizationAddress
    );

    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);
    const project = new PublicKey(params.projectAddress);
    const assignee = new PublicKey(params.assignee);
    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(params.proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

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

    // Create a new program instance for fetching
    const fetchProgram = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    // Get proposal data to get task title
    const proposalAccount =
      await fetchProgram.account.taskProposal.fetch(proposal);
    const taskTitle = proposalAccount.title;
    // Calculate task PDA
    const [taskPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('task'),
        organization.toBuffer(),
        project.toBuffer(),
        Buffer.from(taskTitle)
      ],
      this.PROGRAM_ID
    );

    const voterTokenAccount = tokenAccounts.value[0].pubkey;

    // Find task vault PDA
    const [taskVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('task_vault'), taskPDA.toBuffer()],
      this.PROGRAM_ID
    );

    // Find vault authority PDA
    const [vaultAuthorityPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), taskPDA.toBuffer()],
      this.PROGRAM_ID
    );

    // Find vault token account PDA
    const [vaultTokenAccountPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_token_account'), taskPDA.toBuffer()],
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

    console.log({ assignee });
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

    const instruction = program.instruction.voteOnTaskProposal(params.vote, {
      accounts: {
        voter: new PublicKey(params.proposerWallet),
        organization,
        proposal,
        project,
        voterTokenAccount,
        treasuryTokenAccount,
        treasuryAuthority: treasuryAuthorityPDA,
        destinationTokenAccount,
        task: taskPDA,
        taskVault: taskVaultPDA,
        tokenMint,
        vaultTokenAccount: vaultTokenAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: new PublicKey(
          'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        ),
        rent: new PublicKey('SysvarRent111111111111111111111111111111111')
      }
    });

    return {
      instruction,
      contributorPDA
    };
  }

  async createProjectProposal(dto: CreateProjectProposalDto) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const organization = new PublicKey(dto.organizationAddress);

    const onChainOrganization = await this.getOrganizationDetails(
      dto.organizationAddress
    );

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
      onChainOrganization.treasuryBalances[0].mint
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
      dto.description,
      dto.members,
      dto.projectProposalThreshold,
      new BN(dto.projectProposalValidityPeriod * 24 * 60 * 60),
      {
        accounts: {
          organization,
          proposal: proposalPDA,
          proposer: new PublicKey(dto.proposerWallet),
          proposerTokenAccount,
          systemProgram: SystemProgram.programId
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
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);

    const onChainOrganization = await this.getOrganizationDetails(
      params.organizationAddress
    );

    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
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

    const instruction = program.instruction.voteOnProjectProposal(params.vote, {
      accounts: {
        organization,
        proposal,
        voterTokenAccount,
        systemProgram: SystemProgram.programId,
        voter: new PublicKey(params.proposerWallet),
        project: projectPDA,
        rent: new PublicKey('SysvarRent111111111111111111111111111111111')
      }
    });

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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
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
      description: project.account.description,
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    const project = await program.account.project.fetch(
      new PublicKey(projectAccountAddress)
    );

    return {
      accountAddress: projectAccountAddress,
      organization: project.organization.toBase58(),
      uuid: convertUuid(project.uuid),
      title: project.title,
      members: project.members.map((member) => member.toBase58()),
      taskApprovalThreshold: project.taskApprovalThreshold,
      validityEndTime: project.validityEndTime.toNumber(),
      isActive: project.isActive
    };
  }

  async createTaskProposal(dto: {
    projectAddress: string;
    title: string;
    paymentAmount: number;
    assignee: string;
    description: string; // New parameter for description
    organizationAddress: string; // Organization address
    userPrimaryWallet: string;
  }) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const onChainOrganization = await this.getOrganizationDetails(
      dto.organizationAddress
    );

    // Verify they're valid public keys
    const project = new PublicKey(dto.projectAddress);
    const assignee = new PublicKey(dto.assignee);
    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
    );
    const organization = new PublicKey(dto.organizationAddress);

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
      { mint: new PublicKey(organizationDetails.tokenMint) }
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

    // Calculate PDA for contributor proposal
    const [proposalPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('task_proposal'),
        organization.toBuffer(),
        project.toBuffer(),
        Buffer.from(dto.title)
      ],
      this.PROGRAM_ID
    );

    const instruction = program.instruction.proposeTask(
      dto.title,
      dto.description,
      new BN(paymentAmountTokenUnits),
      assignee,
      tokenMint,
      {
        accounts: {
          proposer: new PublicKey(dto.userPrimaryWallet),
          organization,
          project,
          proposal: proposalPDA,
          tokenRegistry: tokenRegistryPDA,
          treasuryTokenAccount: treasuryTokenAccount,
          treasuryAuthority: treasuryAuthorityPDA,
          destinationTokenAccount: destinationTokenAccount,
          proposerTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId
        }
      }
    );

    return {
      instruction,
      proposalPDA
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
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
      accountAddress: task.publicKey.toBase58(),
      project: task.account.project.toBase58(),
      description: task.account.description,
      title: task.account.title,
      paymentAmount: task.account.paymentAmount.toNumber(),
      assignee: task.account.assignee.toBase58(),
      votesFor: task.account.votesFor,
      votesAgainst: task.account.votesAgainst,
      status: Object.keys(task.account.status)[0],
      voters: task.account.voters.map((voter) => voter.toBase58()),
      transferProposal: task.account.transferProposal?.toBase58(),
      vault: task.account.vault?.toBase58(),
      reviewer: task.account.reviewer?.toBase58()
    }));
  }

  async getUserTasks(userAddress: string) {
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    // Account discriminator (8) + project pubkey (32) = 40
    const discriminatorOffset = 8;
    const projectOffset = 32;

    const tasks = await program.account.task.all([
      {
        memcmp: {
          offset: discriminatorOffset + projectOffset,
          bytes: userAddress
        }
      }
    ]);

    return tasks.map((task) => ({
      accountAddress: task.publicKey.toBase58(),
      project: task.account.project.toBase58(),
      title: task.account.title,
      paymentAmount: task.account.paymentAmount.toNumber(),
      assignee: task.account.assignee.toBase58(),
      votesFor: task.account.votesFor,
      votesAgainst: task.account.votesAgainst,
      status: Object.keys(task.account.status)[0],
      voters: task.account.voters.map((voter) => voter.toBase58()),
      transferProposal: task.account.transferProposal?.toBase58(),
      vault: task.account.vault?.toBase58(),
      reviewer: task.account.reviewer?.toBase58()
    }));
  }

  async getTaskDetails(taskAddress: string) {
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    const task = await program.account.task.fetch(new PublicKey(taskAddress));

    return {
      accountAddress: taskAddress,
      project: task.project.toBase58(),
      title: task.title,
      paymentAmount: task.paymentAmount.toNumber(),
      assignee: task.assignee.toBase58(),
      votesFor: task.votesFor,
      votesAgainst: task.votesAgainst,
      status: Object.keys(task.status)[0],
      voters: task.voters.map((voter) => voter.toBase58()),
      transferProposal: task.transferProposal?.toBase58(),
      vault: task.vault?.toBase58(),
      reviewer: task.reviewer?.toBase58()
    };
  }

  async completeTask(taskAddress: string) {
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    const task = await program.account.task.fetch(new PublicKey(taskAddress));
    const project = await program.account.project.fetch(task.project);

    const onChainOrganization = await this.getOrganizationDetails(
      project.organization.toBase58()
    );

    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
    );

    if (!task.vault) {
      throw new Error('Task vault not found');
    }

    // Find task vault PDA
    const [taskVaultPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('task_vault'), new PublicKey(taskAddress).toBuffer()],
      this.PROGRAM_ID
    );

    // Find vault authority PDA
    const [vaultAuthorityPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), new PublicKey(taskAddress).toBuffer()],
      this.PROGRAM_ID
    );

    // Find vault token account PDA
    const [vaultTokenAccountPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('vault_token_account'),
        new PublicKey(taskAddress).toBuffer()
      ],
      this.PROGRAM_ID
    );

    // Get the assignee's token account
    const assigneeTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(task.assignee, {
        mint: tokenMint
      });

    if (assigneeTokenAccounts.value.length === 0) {
      throw new Error('No token account found for the assignee');
    }

    const assigneeTokenAccount = assigneeTokenAccounts.value[0].pubkey;

    const instruction = program.instruction.completeTask({
      accounts: {
        assignee: task.assignee,
        project: task.project,
        task: new PublicKey(taskAddress),
        taskVault: taskVaultPDA,
        assigneeTokenAccount: assigneeTokenAccount,
        vaultTokenAccount: vaultTokenAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        tokenProgram: TOKEN_PROGRAM_ID
      }
    });

    return {
      instruction,
      assigneeTokenAccount
    };
  }

  async enableTaskVaultWithdrawal(taskAddress: string, reviewer: string) {
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

    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      provider
    );

    const task = await program.account.task.fetch(new PublicKey(taskAddress));

    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.vault) {
      throw new Error('Task vault not found');
    }

    // Find vault authority PDA
    const [vaultAuthorityPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), new PublicKey(taskAddress).toBuffer()],
      this.PROGRAM_ID
    );

    // Find vault token account PDA
    const [vaultTokenAccountPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('vault_token_account'),
        new PublicKey(taskAddress).toBuffer()
      ],
      this.PROGRAM_ID
    );

    const project = await program.account.project.fetch(task.project);

    const onChainOrganization = await this.getOrganizationDetails(
      project.organization.toBase58()
    );

    const tokenMint = new PublicKey(
      onChainOrganization.treasuryBalances[0].mint
    );

    // Get the assignee's token account
    const assigneeTokenAccounts =
      await connection.getParsedTokenAccountsByOwner(task.assignee, {
        mint: tokenMint
      });

    if (assigneeTokenAccounts.value.length === 0) {
      throw new Error('No token account found for the assignee');
    }

    const assigneeTokenAccount = assigneeTokenAccounts.value[0].pubkey;

    const instruction = program.instruction.enableTaskVaultWithdrawal({
      accounts: {
        reviewer: new PublicKey(reviewer),
        project: task.project,
        task: new PublicKey(taskAddress),
        taskVault: task.vault,
        assigneeTokenAccount,
        vaultTokenAccount: vaultTokenAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY.toString()
      }
    });

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
