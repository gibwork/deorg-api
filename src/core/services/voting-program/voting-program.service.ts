import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';
import idl from './gibwork_voting_program.json';
import { GibworkVotingProgram } from './gibwork_voting_program';
import * as anchor from '@coral-xyz/anchor';
import { CreateOrganizationDto, Proposal } from './types';

@Injectable()
export class VotingProgramService {
  PROGRAM_ID = new PublicKey('o7S2AKHnDyx7nPqoTu4LRKFUf1xPWfrovTgEMqyLoFT');

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
      {
        accounts: {
          creator: walletPublicKey,
          organization: organizationPDA,
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

    console.log(
      'contributors',
      contributors.map((contributor) => contributor.account.authority)
    );

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

    const proposals = await program.account.contributorProposal.all([
      {
        memcmp: {
          offset: 8,
          bytes: organizationAccount
        }
      }
    ]);

    return proposals.map((proposal) => ({
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
    }));
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

    console.log('Contributor PDA:', contributorPDA.toString());

    const instruction = program.instruction.proposeContributor(
      organization,
      candidate,
      proposerTokenAccount,
      contributorPDA,
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
    const organization = new PublicKey(params.organizationAddress);
    const proposal = new PublicKey(params.proposalAddress);
    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(params.proposerWallet),
      { mint: tokenMint }
    );

    if (tokenAccounts.value.length === 0) {
      throw new Error('No token account found for the organization token mint');
    }

    const voterTokenAccount = tokenAccounts.value[0].pubkey;

    // Create instruction data
    // Anchor discriminator for voteOnContributorProposal is [103, 215, 229, 85, 252, 164, 113, 142]
    const discriminator = Buffer.from([103, 215, 229, 85, 252, 164, 113, 142]);

    // Create a buffer for the vote boolean
    const voteBuffer = Buffer.alloc(1);
    voteBuffer.writeUInt8(params.vote ? 1 : 0, 0);

    const data = Buffer.concat([discriminator, voteBuffer]);

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

    console.log('Contributor PDA:', contributorPDA.toString());

    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(params.proposerWallet),
          isSigner: true,
          isWritable: true
        },
        { pubkey: organization, isSigner: false, isWritable: true },
        { pubkey: proposal, isSigner: false, isWritable: true },
        { pubkey: contributorPDA, isSigner: false, isWritable: true },
        { pubkey: voterTokenAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.PROGRAM_ID,
      data
    });

    return {
      instruction,
      contributorPDA
    };
  }
}

function serializeBN(bn: BN, byteLength: number): Buffer {
  const buf = Buffer.alloc(byteLength);
  const arr = bn.toArray().reverse();
  arr.forEach((value: number, index: number) => {
    if (index < byteLength) {
      buf.writeUInt8(value, index);
    }
  });
  return buf;
}

/**
 * Parse contributor proposal account data
 */
export function parseContributorProposalData(
  data: Buffer,
  pubkey: PublicKey
): any {
  try {
    // Skip the 8-byte discriminator
    if (data.length < 8) {
      throw new Error('Account data too short');
    }

    const dataBuffer = data.slice(8);

    // Expected contributor proposal structure:
    // - 32 bytes organization pubkey
    // - 32 bytes candidate pubkey
    // - 32 bytes proposer pubkey
    // - 8 bytes proposed_rate (u64)
    // - 8 bytes created_at (i64)
    // - 8 bytes expires_at (i64)
    // - 1 byte votes_for (u8)
    // - 1 byte votes_against (u8)
    // - 1 byte status
    // - 4 bytes voters array length + N * 32 bytes voters

    if (dataBuffer.length < 32 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 1 + 4) {
      throw new Error('Account data too short for contributor proposal');
    }

    let offset = 0;

    // Extract organization (32 bytes)
    const organization = new PublicKey(dataBuffer.slice(offset, offset + 32));
    offset += 32;

    // Extract candidate (32 bytes)
    const candidate = new PublicKey(dataBuffer.slice(offset, offset + 32));
    offset += 32;

    // Extract proposer (32 bytes)
    const proposer = new PublicKey(dataBuffer.slice(offset, offset + 32));
    offset += 32;

    // Extract proposed_rate (8 bytes)
    const proposedRate = dataBuffer.readBigUInt64LE(offset);
    offset += 8;

    // Extract created_at (8 bytes)
    const createdAt = dataBuffer.readBigInt64LE(offset);
    offset += 8;

    // Extract expires_at (8 bytes)
    const expiresAt = dataBuffer.readBigInt64LE(offset);
    offset += 8;

    // Extract votes_for (1 byte)
    const votesFor = dataBuffer.readUInt8(offset);
    offset += 1;

    // Extract votes_against (1 byte)
    const votesAgainst = dataBuffer.readUInt8(offset);
    offset += 1;

    // Extract status (1 byte)
    const statusValue = dataBuffer.readUInt8(offset);
    offset += 1;

    // Map status value to string
    let status: 'Active' | 'Approved' | 'Rejected' | 'Expired';
    switch (statusValue) {
      case 0:
        status = 'Active';
        break;
      case 1:
        status = 'Approved';
        break;
      case 2:
        status = 'Rejected';
        break;
      case 3:
        status = 'Expired';
        break;
      default:
        status = 'Active'; // Default to Active if unknown
    }

    // Extract voters
    const votersLength = dataBuffer.readUInt32LE(offset);
    offset += 4;

    // Validate voters length is reasonable
    if (votersLength > 1000 || offset + votersLength * 32 > dataBuffer.length) {
      throw new Error(`Invalid voters length: ${votersLength}`);
    }

    const voters: PublicKey[] = [];
    for (let i = 0; i < votersLength; i++) {
      const voterPubkey = new PublicKey(dataBuffer.slice(offset, offset + 32));
      voters.push(voterPubkey);
      offset += 32;
    }

    // Return the parsed data
    return {
      proposalAddress: pubkey,
      organization,
      candidate,
      proposer,
      proposedRate,
      createdAt,
      expiresAt,
      votesFor,
      votesAgainst,
      status,
      voters
    };
  } catch (error) {
    console.error('Error parsing contributor proposal data:', error);

    // Return a default object with the pubkey
    return {
      proposalAddress: pubkey,
      organization: PublicKey.default,
      candidate: PublicKey.default,
      proposer: PublicKey.default,
      proposedRate: BigInt(0),
      createdAt: BigInt(0),
      expiresAt: BigInt(0),
      votesFor: 0,
      votesAgainst: 0,
      status: 'Active',
      voters: []
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
