# Deorg Voting Program

A Solana-based decentralized voting program for organizational governance, contributor management, and project task execution built using Anchor 0.31.1.

## Features and Business Rules

- **Organization-based Governance Structure**: Organizations are created with a founding creator who has special privileges to update parameters, and contain multiple contributors who can vote on proposals.

- **Token-Gated Voting Mechanism**: Voting rights are tied to token ownership with a configurable minimum token requirement, ensuring stakeholders have skin in the game.

- **Contributor Management with Time Constraints**: Contributors have validity periods and can be proposed/voted in by existing contributors, requiring a threshold percentage of votes to be approved.

- **Configurable Threshold Parameters**: Organizations can set different threshold percentages for contributor proposals and project proposals, allowing customization of governance strictness.

- **Project Proposal System**: Projects include title, budget, member list, and task approval thresholds, requiring sufficient votes to be approved before tasks can be created.

- **Task-based Work Management**: Approved projects can have tasks with specific payments, assignees, and voting requirements among project members before they're marked complete.

- **Time-bound Validity Controls**: Proposals and contributors have expiration timestamps, automatically invalidating proposals after their validity period ends and requiring contributor renewals.

- **Threshold-based Approval Logic**: The system calculates approval percentages based on votes for and against, comparing against configurable thresholds to determine outcomes.

- **Event Emission System**: Key actions (proposals, votes, task completions) emit events for external systems to track governance activities.

- **Robust Authorization Checks**: All operations validate that the caller has appropriate permissions (creator, contributor, project member) before allowing actions.

## Program Structure

The implementation is organized into several modules:

- **state.rs** - Account structures and enums
- **errors.rs** - Custom error types
- **utils.rs** - Utility functions
- **organization.rs** - Organization management
- **contributor.rs** - Contributor management
- **project.rs** - Project management
- **task.rs** - Task management
- **lib.rs** - Program entrypoints

## Development Setup

### Prerequisites

- Rust installed with Solana toolchain
- Anchor 0.31.1
- Solana CLI

### Build

```bash
# Build the program
anchor build

# Run tests
anchor test
```

### Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Usage

The program provides Anchor-based instructions for:

1. Creating and updating organizations
2. Proposing and voting on new contributors
3. Proposing and voting on projects
4. Creating, voting on, and completing tasks

Refer to the tests in `tests/deorg-voting-program.ts` for examples of how to interact with the program.

### Organization Creation

When creating an organization, a Contributor account is automatically created for the organization creator. The organization creator must specify a `creator_rate` parameter which sets their payment rate as a contributor.

#### Client-side Example

```typescript
// Derive the organization PDA
const [organizationPDA] = await PublicKey.findProgramAddress(
  [
    Buffer.from('organization'),
    wallet.publicKey.toBuffer(),
    new Uint8Array(organizationUuid)
  ],
  program.programId
);

// Derive the contributor PDA for the creator
const [creatorContributorPDA] = await PublicKey.findProgramAddress(
  [
    Buffer.from('contributor'),
    organizationPDA.toBuffer(),
    wallet.publicKey.toBuffer()
  ],
  program.programId
);

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
    minimumTokenRequirement,
    treasuryTransferThresholdPercentage,
    treasuryTransferProposalValidityPeriod,
    treasuryTransferQuorumPercentage,
    creatorRate // Payment rate for the creator as a contributor
  )
  .accounts({
    creator: wallet.publicKey,
    organization: organizationPDA,
    tokenMint: tokenMint,
    creatorTokenAccount: creatorTokenAccount,
    creatorContributor: creatorContributorPDA, // Include this account
    systemProgram: SystemProgram.programId
  })
  .rpc();
```

The propose_contributor instruction requires:

Accounts:
proposer (signer): The wallet proposing the contributor
organization: The organization PDA
proposal: A PDA derived from organization and candidate
candidate: The public key of the proposed contributor
proposer_token_account: Token account of proposer
system_program: System program
Arguments:
proposed_rate: The proposed payment rate as a u64
