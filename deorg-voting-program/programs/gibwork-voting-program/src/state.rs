use anchor_lang::prelude::*;

#[account]
pub struct OrganizationMetadata {
    pub organization: Pubkey,     // The organization this metadata belongs to
    pub logo_url: Option<String>, // Optional logo image URL
    pub website_url: Option<String>, // Optional website URL
    pub twitter_url: Option<String>, // Optional Twitter/X URL 
    pub discord_url: Option<String>, // Optional Discord URL
    pub telegram_url: Option<String>, // Optional Telegram URL
    pub description: Option<String>, // Optional organization description
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Active,
    Approved,
    Rejected,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    Proposed,
    Approved,
    Ready,     // Both task and transfer proposal approved, funds in vault
    Completed,
    Rejected,
    Paid,      // Task has been completed, reviewed, and payment has been withdrawn
}

#[account]
pub struct Organization {
    pub creator: Pubkey,
    pub uuid: [u8; 16],    // Organization UUID for unique identification
    pub name: String,      // Human-readable organization name
    pub contributors: Vec<Pubkey>,
    pub contributor_proposal_threshold_percentage: u8,
    pub contributor_proposal_validity_period: i64, // In seconds
    pub contributor_validity_period: i64, // In seconds
    pub contributor_proposal_quorum_percentage: u8, // Minimum % of contributors who must vote
    pub project_proposal_threshold_percentage: u8,
    pub project_proposal_validity_period: i64, // In seconds
    pub token_mint: Pubkey,
    pub minimum_token_requirement: u64,
    
    // New treasury-related fields
    pub treasury_transfer_threshold_percentage: u8,
    pub treasury_transfer_proposal_validity_period: i64, // In seconds
    pub treasury_transfer_quorum_percentage: u8, // Minimum % of contributors who must vote
}

#[account]
pub struct Contributor {
    pub organization: Pubkey,
    pub authority: Pubkey,
    pub rate: u64, // Payment per minute in lamports
    pub validity_end_time: i64, // Timestamp
    pub is_active: bool,
}

#[account]
pub struct ContributorProposal {
    pub organization: Pubkey,
    pub candidate: Pubkey,
    pub proposer: Pubkey,
    pub proposed_rate: u64,
    pub created_at: i64,
    pub expires_at: i64,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
    pub voters: Vec<Pubkey>,
}

#[account]
pub struct ProjectProposal {
    pub organization: Pubkey,
    pub proposer: Pubkey,
    pub title: String,
    pub description: String, // Project description
    pub member_pubkeys: Vec<Pubkey>,
    pub task_approval_threshold: u8,
    pub validity_period: i64,
    pub created_at: i64,
    pub expires_at: i64,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
    pub voters: Vec<Pubkey>,
}

#[account]
pub struct Project {
    pub organization: Pubkey,
    pub uuid: [u8; 16],    // Project UUID for unique identification
    pub title: String,
    pub description: String, // Project description
    pub members: Vec<Pubkey>,
    pub task_approval_threshold: u8,
    pub validity_end_time: i64,
    pub is_active: bool,
}

#[account]
pub struct TaskProposal {
    pub organization: Pubkey,            // Organization this task belongs to
    pub project: Pubkey,                 // Project this task belongs to
    pub proposer: Pubkey,                // Who proposed the task
    pub title: String,                   // Task title
    pub description: String,             // Detailed task description
    pub payment_amount: u64,             // Amount to be paid for task completion
    pub assignee: Pubkey,                // Who will complete the task
    pub token_mint: Pubkey,              // Which token to pay in
    pub destination: Pubkey,             // Destination token account (assignee's)
    pub created_at: i64,                 // Timestamp
    pub expires_at: i64,                 // When proposal expires
    pub votes_for: u32,                  // Number of votes for
    pub votes_against: u32,              // Number of votes against
    pub status: ProposalStatus,          // Current status
    pub voters: Vec<Pubkey>,             // Who has voted
}

#[account]
pub struct Task {
    pub project: Pubkey,
    pub assignee: Pubkey,
    pub status: TaskStatus,
    pub title: String,
    pub description: String,                // Detailed task description
    pub payment_amount: u64,
    pub votes_for: u32,
    pub votes_against: u32,
    pub voters: Vec<Pubkey>,
    pub transfer_proposal: Option<Pubkey>,  // Link to the treasury transfer proposal
    pub vault: Option<Pubkey>,              // Link to the task vault once created
    pub reviewer: Option<Pubkey>,           // The project member who reviewed and approved the task
}

// New task vault struct
#[account]
pub struct TaskVault {
    pub task: Pubkey,
    pub token_mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
    pub assignee: Pubkey,
    pub is_withdrawable: bool,
}

// New treasury related structs
#[account]
pub struct TreasuryTokenRegistry {
    pub organization: Pubkey,
    pub token_accounts: Vec<TreasuryTokenAccount>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TreasuryTokenAccount {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub is_active: bool,
}

#[account]
pub struct TreasuryTransferProposal {
    pub organization: Pubkey,
    pub proposer: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub created_at: i64,
    pub expires_at: i64,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
    pub voters: Vec<Pubkey>,
    pub description: String, // Description of what the funds will be used for
}

// Constants for space calculation
impl Organization {
    pub const MAX_SIZE: usize = 32 + // creator
                                16 + // uuid
                                4 + 120 + // name (max 120 chars)
                                4 + (32 * 50) + // contributors (assuming max 50)
                                1 + // contributor_proposal_threshold_percentage
                                8 + // contributor_proposal_validity_period
                                8 + // contributor_validity_period
                                1 + // contributor_proposal_quorum_percentage
                                1 + // project_proposal_threshold_percentage
                                8 + // project_proposal_validity_period
                                32 + // token_mint
                                8 + // minimum_token_requirement
                                1 + // treasury_transfer_threshold_percentage
                                8 + // treasury_transfer_proposal_validity_period
                                1; // treasury_transfer_quorum_percentage
}

impl Contributor {
    pub const MAX_SIZE: usize = 32 + // organization
                               32 + // authority
                               8 + // rate
                               8 + // validity_end_time
                               1; // is_active
}

impl ContributorProposal {
    pub const MAX_SIZE: usize = 32 + // organization
                               32 + // candidate
                               32 + // proposer
                               8 + // proposed_rate
                               8 + // created_at
                               8 + // expires_at
                               4 + // votes_for
                               4 + // votes_against
                               1 + // status
                               4 + (32 * 50); // voters (assuming max 50)
}

impl ProjectProposal {
    pub const MAX_SIZE: usize = 32 + // organization
                               32 + // proposer
                               4 + 100 + // title (max 100 chars)
                               4 + 500 + // description (max 500 chars)
                               4 + (32 * 20) + // member_pubkeys (assuming max 20)
                               1 + // task_approval_threshold
                               8 + // validity_period
                               8 + // created_at
                               8 + // expires_at
                               4 + // votes_for
                               4 + // votes_against
                               1 + // status
                               4 + (32 * 50); // voters (assuming max 50)
}

impl Project {
    pub const MAX_SIZE: usize = 32 + // organization
                              16 + // uuid
                              4 + 100 + // title (max 100 chars)
                              4 + 500 + // description (max 500 chars)
                              4 + (32 * 20) + // members (assuming max 20)
                              1 + // task_approval_threshold
                              8 + // validity_end_time
                              1; // is_active
}

impl TaskProposal {
    pub const MAX_SIZE: usize = 32 + // organization
                               32 + // project
                               32 + // proposer
                               4 + 100 + // title (max 100 chars)
                               4 + 1000 + // description (max 1000 chars)
                               8 + // payment_amount
                               32 + // assignee
                               32 + // token_mint
                               32 + // destination
                               8 + // created_at
                               8 + // expires_at
                               4 + // votes_for
                               4 + // votes_against
                               1 + // status
                               4 + (32 * 20); // voters (assuming max 20)
}

impl Task {
    pub const MAX_SIZE: usize = 32 + // project
                              32 + // assignee
                              1 + // status
                              4 + 100 + // title (max 100 chars)
                              4 + 1000 + // description (max 1000 chars)
                              8 + // payment_amount
                              4 + // votes_for
                              4 + // votes_against
                              4 + (32 * 20) + // voters (assuming max 20)
                              1 + 32 + // transfer_proposal (optional pubkey)
                              1 + 32 + // vault (optional pubkey)
                              1 + 32; // reviewer (optional pubkey)
}

impl TaskVault {
    pub const MAX_SIZE: usize = 32 + // task
                              32 + // token_mint
                              32 + // token_account
                              8 + // amount
                              32 + // assignee
                              1; // is_withdrawable
}

impl TreasuryTokenRegistry {
    pub const MAX_SIZE: usize = 32 + // organization
                               4 + (72 * 20); // token_accounts (assuming max 20 tokens)
                                             // Each entry is 32 (mint) + 32 (account) + 1 (is_active) + 7 (padding) = 72 bytes
}

impl TreasuryTransferProposal {
    pub const MAX_SIZE: usize = 32 + // organization
                               32 + // proposer
                               32 + // token_mint
                               8 + // amount
                               32 + // destination
                               8 + // created_at
                               8 + // expires_at
                               4 + // votes_for
                               4 + // votes_against
                               1 + // status
                               4 + (32 * 50) + // voters (assuming max 50)
                               4 + 200; // description (max 200 chars)
}

impl OrganizationMetadata {
    pub const MAX_URL_LENGTH: usize = 200; // Maximum length for any URL
    pub const MAX_DESCRIPTION_LENGTH: usize = 500; // Maximum length for description
    
    pub const MAX_SIZE: usize = 32 + // organization
                              1 + (4 + Self::MAX_URL_LENGTH) + // logo_url (Option<String>)
                              1 + (4 + Self::MAX_URL_LENGTH) + // website_url (Option<String>)
                              1 + (4 + Self::MAX_URL_LENGTH) + // twitter_url (Option<String>)
                              1 + (4 + Self::MAX_URL_LENGTH) + // discord_url (Option<String>)
                              1 + (4 + Self::MAX_URL_LENGTH) + // telegram_url (Option<String>)
                              1 + (4 + Self::MAX_DESCRIPTION_LENGTH); // description (Option<String>)
}
