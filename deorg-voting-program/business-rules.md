# Deorg Voting Program: Business Rules

## Organization Management

1. **Organization Creation**

   - Multiple organizations can be created per wallet address
   - Each organization requires a unique UUID provided at creation time
   - Organizations must have a human-readable name (1-120 characters)
   - Creator becomes the first contributor automatically
   - Organization creator must have a valid token account for the specified token mint
   - All threshold values must be between 0-100%
   - All validity periods must be positive values
   - Quorum percentage must be greater than 0%

2. **Organization Identity**

   - Organizations have both a UUID and a human-readable name
   - UUIDs are immutable after creation and ensure global uniqueness
   - Organization names must be non-empty and maximum 120 characters
   - Organizations can be looked up by both UUID and creator address

3. **Organization Parameters**
   - Only the original creator can update organization parameters
   - Parameter updates must pass the same validation rules as creation
   - Organization names can be updated by the creator
   - UUID cannot be modified after creation

## Contributor Management

3. **Contributor Proposal Rules**

   - Only existing contributors can propose new contributors
   - Proposer must have sufficient tokens (as defined by minimum_token_requirement)
   - Candidate cannot already be a contributor
   - Proposer automatically casts a "yes" vote on their proposal
   - Each proposal has a validity period after which it expires
   - Each proposal creates a unique PDA derived from organization address and candidate address

4. **Contributor Voting Rules**

   - Only existing contributors can vote on proposals
   - Voters must have sufficient tokens to vote
   - Each contributor can vote only once per proposal
   - Voting is not allowed on expired proposals
   - Both FOR and AGAINST votes are tracked separately

5. **Proposal Approval Rules**

   - Quorum requirement: A minimum percentage of all contributors must vote
   - Threshold requirement: A minimum percentage of votes must be FOR (vs AGAINST)
   - Both quorum and threshold requirements must be met for approval
   - Once approved, candidate is automatically added to contributor list
   - For approved proposals, a contributor account is created with specified rate
   - Contributors have a limited validity period that must be renewed

6. **Contributor Renewal Rules**
   - A contributor can renew their own contributor status
   - Renewal extends the validity period by organization.contributor_validity_period
   - Contributor must still be in the organization's contributor list

## Project Proposals

7. **Project Proposal Rules**

   - Only contributors can propose projects
   - Project budget must be greater than zero
   - Task approval threshold must be valid (0-100%)
   - All project members must be valid contributors
   - Proposer automatically casts a "yes" vote on their project proposal

8. **Project Voting Rules**
   - Only contributors can vote on project proposals
   - Voters must have sufficient tokens
   - Each contributor can vote only once per project proposal
   - Both quorum and threshold requirements must be met for approval

## Security Rules

9. **Token Validation**

   - Users must hold a minimum number of governance tokens to participate
   - Token accounts must be owned by the Solana token program

10. **Account Validation**

    - Organization PDAs are derived using three seeds: "organization", creator_pubkey, and uuid
    - Other PDAs are derived using appropriate seeds to ensure uniqueness
    - Account constraints verify relationships between accounts
    - Transaction signers are verified to match required authorities

11. **Status Transitions**
    - Proposal status can be: Active → Approved/Rejected/Expired
    - Expired proposals cannot be voted on or approved
    - Task status follows a specific workflow: Proposed → Approved → Completed

## Governance Model

12. **Decentralized Decision Making**

    - Major decisions require consensus through voting
    - Quorum ensures broad participation in governance
    - Threshold percentages can be configured to balance between majority and super-majority requirements

13. **Contributor Validity**

    - Contributors have time-limited participation rights
    - Renewal mechanism ensures ongoing engagement
    - Inactive contributors are automatically excluded from voting after expiration

14. **Token-Based Governance**
    - Participation rights tied to token holdings
    - Minimum token requirements prevent sybil attacks
    - Token requirements are configurable per organization
