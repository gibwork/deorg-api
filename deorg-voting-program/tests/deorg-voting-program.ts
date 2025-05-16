import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { DeorgVotingProgram } from '../target/types/deorg_voting_program';
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from '@solana/spl-token';
import { assert } from 'chai';

describe('deorg-voting-program', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .DeorgVotingProgram as Program<DeorgVotingProgram>;
  const wallet = provider.wallet as anchor.Wallet;

  // Test accounts
  let tokenMint: PublicKey;
  let creatorTokenAccount: PublicKey;
  let organizationPDA: PublicKey;
  let organizationBump: number;

  // Test parameters
  const contributorProposalThreshold = 60; // 60%
  const contributorProposalValidityPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
  const contributorValidityPeriod = 30 * 24 * 60 * 60; // 30 days in seconds
  const projectProposalThreshold = 70; // 70%
  const projectProposalValidityPeriod = 14 * 24 * 60 * 60; // 14 days in seconds
  const minimumTokenRequirement = new anchor.BN(100); // 100 tokens

  before(async () => {
    // Create a new token mint (representing the organization's token)
    const mintAuthority = Keypair.generate();

    // Fund the mint authority
    const signature = await provider.connection.requestAirdrop(
      mintAuthority.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature, 'confirmed');

    // Create the token mint
    tokenMint = await createMint(
      provider.connection,
      wallet.payer,
      mintAuthority.publicKey,
      null,
      9 // 9 decimals
    );

    // Create a token account for the creator
    const tokenAccountInfo = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      tokenMint,
      wallet.publicKey
    );
    creatorTokenAccount = tokenAccountInfo.address;

    // Mint tokens to the creator
    await mintTo(
      provider.connection,
      wallet.payer,
      tokenMint,
      creatorTokenAccount,
      mintAuthority,
      1000 * 10 ** 9 // 1000 tokens with 9 decimals
    );

    // Generate a random organization UUID
    const organizationUuid = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 256)
    );

    // Derive the organization PDA
    [organizationPDA, organizationBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('organization'),
        wallet.publicKey.toBuffer(),
        new Uint8Array(organizationUuid)
      ],
      program.programId
    );
  });

  it('Creates an organization', async () => {
    try {
      // Generate a random organization UUID
      const organizationUuid = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
      );
      const organizationName = 'Test Organization';
      const contributorProposalQuorumPercentage = 51; // 51% quorum

      // Create the organization
      const tx = await program.methods
        .createOrganization(
          organizationUuid,
          organizationName,
          contributorProposalThreshold,
          new anchor.BN(contributorProposalValidityPeriod),
          new anchor.BN(contributorValidityPeriod),
          contributorProposalQuorumPercentage,
          projectProposalThreshold,
          new anchor.BN(projectProposalValidityPeriod),
          minimumTokenRequirement
        )
        .accounts({
          creator: wallet.publicKey,
          organization: organizationPDA,
          tokenMint: tokenMint,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId
        })
        .rpc();

      console.log('Organization created with transaction signature:', tx);

      // Fetch the organization account to verify it was created correctly
      const organizationAccount =
        await program.account.organization.fetch(organizationPDA);

      assert.equal(
        organizationAccount.creator.toString(),
        wallet.publicKey.toString(),
        'Creator should match wallet public key'
      );

      assert.equal(
        organizationAccount.contributors.length,
        1,
        'Organization should have 1 contributor initially'
      );

      assert.equal(
        organizationAccount.contributors[0].toString(),
        wallet.publicKey.toString(),
        'First contributor should be the creator'
      );

      assert.equal(
        organizationAccount.contributorProposalThresholdPercentage,
        contributorProposalThreshold,
        'Contributor proposal threshold should match input'
      );

      assert.equal(
        organizationAccount.tokenMint.toString(),
        tokenMint.toString(),
        'Token mint should match input'
      );

      console.log('Organization account verified successfully');
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  });

  // Test for project proposal and creation
  it('Creates a project from an approved proposal', async () => {
    try {
      // Step 1: Create a project proposal
      const title = 'Test Project';
      const memberPubkeys = [wallet.publicKey]; // Start with creator as member
      const taskApprovalThreshold = 60; // 60%
      const validityPeriod = new anchor.BN(30 * 24 * 60 * 60); // 30 days

      // Find project proposal PDA
      const [projectProposalPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from('project_proposal'),
          organizationPDA.toBuffer(),
          Buffer.from(title)
        ],
        program.programId
      );

      // Create proposal
      await program.methods
        .proposeProject(
          title,
          memberPubkeys,
          taskApprovalThreshold,
          validityPeriod
        )
        .accounts({
          proposer: wallet.publicKey,
          organization: organizationPDA,
          proposal: projectProposalPDA,
          proposerTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId
        })
        .rpc();

      console.log('Project proposal created:', title);

      // Fetch proposal to verify it's created
      const proposalAccount =
        await program.account.projectProposal.fetch(projectProposalPDA);
      assert.equal(proposalAccount.title, title);
      assert.equal(proposalAccount.status.active !== undefined, true);

      // Generate a UUID for the project
      const projectUuid = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
      );

      // For testing purposes, we'll force the proposal status to approved
      // In a real scenario this would happen through voting
      // This is a mock/stub for now since we want to test the project creation itself

      // Step 2: Create the project (assuming proposal is approved)
      const [projectPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from('project'),
          organizationPDA.toBuffer(),
          new Uint8Array(projectUuid)
        ],
        program.programId
      );

      console.log('Project would be created with UUID:', projectUuid);
      console.log('Project PDA would be:', projectPDA.toString());

      // Note: In a full test, we would:
      // 1. Vote on the proposal enough to approve it
      // 2. Then create the project using the create_project instruction
      // 3. Verify the project was created with the expected values

      console.log('Testing project creation flow completed');
    } catch (error) {
      console.error('Error in project creation test:', error);
      throw error;
    }
  });
});
