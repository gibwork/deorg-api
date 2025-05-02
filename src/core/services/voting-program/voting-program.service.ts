import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { HeliusService } from '../helius/helius.service';
import BN from 'bn.js';
import { Injectable } from '@nestjs/common';

type CreateOrganizationDto = {
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

@Injectable()
export class VotingProgramService {
  PROGRAM_ID = new PublicKey('J71VLY6cxH9G9WA5Z1W3mhqMpVVx65vvCYtixegTUKG4');
  constructor(private readonly heliusService: HeliusService) {}

  async createOrganization(dto: CreateOrganizationDto) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

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

    // Create instruction data
    // Anchor discriminator for createOrganization is [60, 173, 177, 39, 122, 23, 68, 185]
    const discriminator = Buffer.from([60, 173, 177, 39, 122, 23, 68, 185]);

    // Convert UUID number array to Buffer
    const uuidBuf = Buffer.from(new Uint8Array(uuidBytes));

    const nameBuffer = Buffer.from(dto.name, 'utf-8');
    const nameLengthBuf = Buffer.alloc(4);
    nameLengthBuf.writeUInt32LE(nameBuffer.length, 0);

    const contributorProposalValidityPeriodSecs =
      dto.contributorProposalValidityPeriod * 24 * 60 * 60;
    const contributorValidityPeriodSecs =
      dto.contributorValidityPeriod * 24 * 60 * 60;
    const projectProposalValidityPeriodSecs =
      dto.projectProposalValidityPeriod * 24 * 60 * 60;

    const contributorProposalThresholdBuf = serializeNumber(
      dto.contributorProposalThreshold,
      1
    );
    const contributorProposalValidityPeriodBuf = serializeBN(
      new BN(contributorProposalValidityPeriodSecs),
      8
    );
    const contributorValidityPeriodBuf = serializeBN(
      new BN(contributorValidityPeriodSecs),
      8
    );
    const contributorProposalQuorumPercentageBuf = serializeNumber(
      dto.contributorProposalQuorumPercentage,
      1
    );
    const projectProposalThresholdBuf = serializeNumber(
      dto.projectProposalThreshold,
      1
    );
    const projectProposalValidityPeriodBuf = serializeBN(
      new BN(projectProposalValidityPeriodSecs),
      8
    );
    const minimumTokenRequirementBuf = serializeBN(
      new BN(dto.minimumTokenRequirement),
      8
    );

    // Treasury parameters
    const treasuryTransferThresholdBuf = serializeNumber(
      dto.treasuryTransferThresholdPercentage || 70,
      1
    );
    const treasuryTransferValidityPeriodBuf = serializeBN(
      new BN(
        dto.treasuryTransferProposalValidityPeriod
          ? dto.treasuryTransferProposalValidityPeriod * 24 * 60 * 60
          : 14 * 24 * 60 * 60
      ),
      8
    );
    const treasuryTransferQuorumBuf = serializeNumber(
      dto.treasuryTransferQuorumPercentage || 40,
      1
    );

    const data = Buffer.concat([
      discriminator,
      uuidBuf, // UUID
      nameLengthBuf,
      nameBuffer, // Organization name
      contributorProposalThresholdBuf,
      contributorProposalValidityPeriodBuf,
      contributorValidityPeriodBuf,
      contributorProposalQuorumPercentageBuf,
      projectProposalThresholdBuf,
      projectProposalValidityPeriodBuf,
      minimumTokenRequirementBuf,
      treasuryTransferThresholdBuf,
      treasuryTransferValidityPeriodBuf,
      treasuryTransferQuorumBuf
    ]);

    const tokenMint = new PublicKey(
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
    );

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { mint: tokenMint }
    );
    const creatorTokenAccount = tokenAccounts.value[0].pubkey;

    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: walletPublicKey,
          isSigner: true,
          isWritable: true
        },
        { pubkey: organizationPDA, isSigner: false, isWritable: true },
        { pubkey: tokenMint, isSigner: false, isWritable: false },
        { pubkey: creatorTokenAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.PROGRAM_ID,
      data
    });

    return { instruction, organizationPDA };
  }

  async getOrganizationContributors(organizationAccount: string) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

    const orgAccount = await connection.getAccountInfo(
      new PublicKey(organizationAccount)
    );

    const dataBuffer = orgAccount.data.slice(8);

    // Correct Organization account structure (from Rust code):
    // - 8 bytes discriminator (already skipped)
    // - 32 bytes creator public key
    // - 16 bytes UUID
    // - 4 bytes name length + name bytes
    // - 4 bytes contributors array length + N * 32 bytes contributors
    // - Configuration fields
    const creatorLen = 32;
    const uuidLen = 16;
    const nameLen = 4;

    let offset = 0;
    // const creator = new PublicKey(dataBuffer.slice(offset, creatorLen));
    offset += creatorLen;

    offset += uuidLen;

    const nameLength = dataBuffer.readUInt32LE(offset);
    offset += nameLen;

    // const nameBytes = dataBuffer.slice(offset, offset + nameLength);
    // const name = nameBytes.toString('utf-8');
    offset += nameLength;

    const contributorsLength = dataBuffer.readUInt32LE(offset);
    offset += 4;

    const contributors: PublicKey[] = [];
    for (let i = 0; i < contributorsLength; i++) {
      const publicKeyBytes = dataBuffer.slice(offset, offset + 32);
      contributors.push(new PublicKey(publicKeyBytes));
      offset += 32;
    }

    return contributors;
  }

  async getOrganizationProposals(organizationAccount: string) {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

    const orgAccount = await connection.getAccountInfo(
      new PublicKey(organizationAccount)
    );

    const dataBuffer = orgAccount.data.slice(8);

    // Correct Organization account structure (from Rust code):
    // - 8 bytes discriminator (already skipped)
    // - 32 bytes creator public key
    // - 16 bytes UUID
    // - 4 bytes name length + name bytes
    // - 4 bytes contributors array length + N * 32 bytes contributors
    // - Configuration fields

    let offset = 0;

    // First field is creator (32 bytes)
    if (offset + 32 > dataBuffer.length) {
      throw new Error('Account data too short for creator');
    }

    const creator = new PublicKey(dataBuffer.slice(offset, offset + 32));
    console.log('Creator:', creator.toString());
    offset += 32;

    // Skip UUID (16 bytes)
    if (offset + 16 > dataBuffer.length) {
      throw new Error('Account data too short for UUID');
    }
    offset += 16;

    // Read name (4 bytes length + name bytes)
    if (offset + 4 > dataBuffer.length) {
      throw new Error('Account data too short for name length');
    }

    const nameLength = dataBuffer.readUInt32LE(offset);
    console.log('Name length:', nameLength);
    offset += 4;

    // Validate name length is reasonable
    // (the Rust code enforces max 120 characters)
    if (nameLength > 120 || offset + nameLength > dataBuffer.length) {
      throw new Error(`Invalid name length: ${nameLength}`);
    }

    // Read name (for debugging)
    const nameBytes = dataBuffer.slice(offset, offset + nameLength);
    const name = nameBytes.toString('utf8');
    console.log('Organization name:', name);
    offset += nameLength;

    // Read contributors array
    if (offset + 4 > dataBuffer.length) {
      throw new Error('Account data too short for contributors length');
    }

    const contributorsLength = dataBuffer.readUInt32LE(offset);
    console.log('Contributors length:', contributorsLength);
    offset += 4;

    // Validate contributors length is reasonable
    if (
      contributorsLength > 100 ||
      offset + contributorsLength * 32 > dataBuffer.length
    ) {
      throw new Error(`Invalid contributors length: ${contributorsLength}`);
    }

    // Extract contributors
    const contributors: PublicKey[] = [];
    for (let i = 0; i < contributorsLength; i++) {
      const publicKeyBytes = dataBuffer.slice(offset, offset + 32);
      contributors.push(new PublicKey(publicKeyBytes));
      offset += 32;
    }

    console.log('Extracted contributors count:', contributors.length);

    // Try to read configuration fields if there's enough data
    if (offset + 35 <= dataBuffer.length) {
      // At least 1 + 8 + 8 + 1 + 1 + 8 + 8 (basic config fields)
      // const contributorProposalThreshold = dataBuffer.readUInt8(offset);
      offset += 1;

      // const contributorProposalValidityPeriodSecs =
      //   dataBuffer.readBigInt64LE(offset);
      // const contributorProposalValidityPeriod =
      //   Number(contributorProposalValidityPeriodSecs) / (24 * 60 * 60);
      offset += 8;

      // const contributorValidityPeriodSecs = dataBuffer.readBigInt64LE(offset);
      // const contributorValidityPeriod =
      //   Number(contributorValidityPeriodSecs) / (24 * 60 * 60);
      offset += 8;

      // New field: contributor_proposal_quorum_percentage
      const contributorProposalQuorumPercentage = dataBuffer.readUInt8(offset);
      offset += 1;
      console.log(
        'Contributor Proposal Quorum Percentage:',
        contributorProposalQuorumPercentage
      );

      // const projectProposalThreshold = dataBuffer.readUInt8(offset);
      offset += 1;

      // const projectProposalValidityPeriodSecs =
      //   dataBuffer.readBigInt64LE(offset);
      // const projectProposalValidityPeriod =
      //   Number(projectProposalValidityPeriodSecs) / (24 * 60 * 60);
      offset += 8;

      // let minimumTokenRequirement = BigInt(0);
      // let tokenMint = PublicKey.default;

      // Try to read minimum token requirement if there's enough data
      if (offset + 8 <= dataBuffer.length) {
        // minimumTokenRequirement = dataBuffer.readBigUInt64LE(offset);
        offset += 8;

        // Try to read token mint if there's enough data
        if (offset + 32 <= dataBuffer.length) {
          // tokenMint = new PublicKey(dataBuffer.slice(offset, offset + 32));
        }
      }

      console.log('Config parsed successfully');
    } else {
      console.warn('Not enough data to parse configuration');
    }

    // Now look for active proposals if we have contributors
    if (contributors.length > 0) {
      try {
        // The known discriminator for ContributorProposal
        const proposalDiscriminator = Buffer.from([
          105, 174, 63, 121, 130, 211, 212, 24
        ]);

        // Get accounts with the correct filters
        console.log(
          'Looking for proposals for organization:',
          organizationAccount
        );

        // First try to search using direct filters that match the PDA structure
        const programID = new PublicKey(
          'BwbgqNkBWiSWxryLycL3wPv7MijCE4XEjrtvKCQxVaxj'
        );

        console.log('Getting all program accounts without filters...');
        // Due to Base58 encoding issues, we'll fetch all accounts and filter client-side
        const allProgramAccounts = await connection.getProgramAccounts(
          programID,
          {
            commitment: 'confirmed'
          }
        );

        // Filter accounts client-side
        console.log(
          `Found ${allProgramAccounts.length} total program accounts`
        );

        // Filter for proposal accounts with the correct discriminator AND matching organization
        const programAccounts = allProgramAccounts.filter((account) => {
          // Check if account data is long enough
          if (account.account.data.length < 8) return false;

          // Check discriminator
          const accountDiscriminator = account.account.data.slice(0, 8);
          const discriminatorMatches =
            Buffer.compare(accountDiscriminator, proposalDiscriminator) === 0;

          if (!discriminatorMatches) return false;

          // Check if it belongs to our organization
          const dataBuffer = account.account.data.slice(8);

          // Make sure the buffer is long enough to contain an organization public key
          if (dataBuffer.length < 32) return false;

          // Organization is the first 32 bytes after discriminator
          const accountOrg = new PublicKey(dataBuffer.slice(0, 32));

          // Compare public keys using toString() to avoid reference equality issues
          return accountOrg.toString() === organizationAccount;
        });

        console.log(
          `Found ${programAccounts.length} accounts with proposal discriminator for this organization`
        );

        console.log(
          `Found ${programAccounts.length} proposal accounts for this organization`
        );

        // Get full account data for each proposal
        const activeProposals: any[] = [];
        for (const accountInfo of programAccounts) {
          try {
            // Fetch the full account data
            const account = await connection.getAccountInfo(accountInfo.pubkey);
            if (!account || account.data.length < 40) {
              console.log(
                'Skipping account with invalid data:',
                accountInfo.pubkey.toString()
              );
              continue;
            }

            // Parse the proposal data using our helper function
            const proposalData = parseContributorProposalData(
              account.data,
              accountInfo.pubkey
            );

            // Add all proposals regardless of status
            console.log(
              `Found proposal: ${accountInfo.pubkey.toString()}, status: ${proposalData.status}`
            );

            // If this is our specific test proposal, log it explicitly
            if (
              accountInfo.pubkey.toString() ===
              'ASLRajXgLNR1JqQgLKoo9SCYuxFJo5bqmHqupsQQBo32'
            ) {
              console.log('FOUND OUR TARGET PROPOSAL:', proposalData);
            }

            activeProposals.push(proposalData);
          } catch (err) {
            console.error('Error parsing proposal account:', err);
            // Skip this proposal and continue
            continue;
          }
        }

        console.log(
          `Found ${activeProposals.length} proposals for this organization`
        );

        return activeProposals.map((proposal) => ({
          proposalAddress: proposal.proposalAddress.toBase58(),
          organization: proposal.organization.toBase58(),
          candidate: proposal.candidate.toBase58(),
          proposer: proposal.proposer.toBase58(),
          proposedRate: Number(proposal.proposedRate),
          createdAt: Number(proposal.createdAt),
          expiresAt: Number(proposal.expiresAt),
          votesFor: Number(proposal.votesFor),
          votesAgainst: Number(proposal.votesAgainst),
          votesTotal: contributors.length,
          status: proposal.status,
          votes: proposal.votes
        }));
      } catch (err) {
        console.error('Error fetching proposals:', err);
        // Continue without proposals
      }
    }
  }

  async createContributorProposal(
    organizationAccount: string,
    candidateWallet: string,
    proposerWallet: string
  ) {
    const PROGRAM_ID = new PublicKey(
      'BwbgqNkBWiSWxryLycL3wPv7MijCE4XEjrtvKCQxVaxj'
    );
    const propoerRate = 100;
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);

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
      PROGRAM_ID
    );

    // Create instruction data
    // Anchor discriminator for proposeContributor is [115, 219, 17, 2, 166, 242, 26, 246]
    const discriminator = Buffer.from([115, 219, 17, 2, 166, 242, 26, 246]);
    const proposedRateBuf = serializeBN(new BN(propoerRate), 8);

    const data = Buffer.concat([discriminator, proposedRateBuf]);

    // Calculate PDA for the contributor account that might be created
    const [contributorPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('contributor'),
        organization.toBuffer(),
        candidate.toBuffer()
      ],
      PROGRAM_ID
    );

    console.log('Contributor PDA:', contributorPDA.toString());

    // Create instruction
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: new PublicKey(proposerWallet),
          isSigner: true,
          isWritable: true
        },
        { pubkey: organization, isSigner: false, isWritable: true },
        { pubkey: proposalPDA, isSigner: false, isWritable: true },
        { pubkey: candidate, isSigner: false, isWritable: false },
        { pubkey: contributorPDA, isSigner: false, isWritable: true },
        { pubkey: proposerTokenAccount, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: PROGRAM_ID,
      data
    });

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

function serializeNumber(n: number, byteLength: number): Buffer {
  const buf = Buffer.alloc(byteLength);
  buf.writeIntLE(n, 0, byteLength);
  return buf;
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
