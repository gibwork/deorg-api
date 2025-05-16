use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, TokenAccount, ID as TokenProgramID};
use crate::state::*;
use crate::errors::VotingError;

// Check if an account is a valid contributor to an organization
pub fn is_valid_contributor(
    organization: &Account<'_, Organization>,
    contributor_key: Pubkey,
) -> Result<bool> {
    // For the prototype version, we just check if the key is in the contributors list
    Ok(organization.contributors.contains(&contributor_key))
}

// Check if a voter has enough tokens to vote
pub fn has_enough_tokens_to_vote(
    token_account: &Account<'_, TokenAccount>,
    organization: &Account<'_, Organization>,
) -> Result<bool> {
    // Check if the token account has at least the minimum required balance
    Ok(token_account.amount >= organization.minimum_token_requirement)
}

// Check if a proposal meets the quorum requirement
pub fn meets_quorum_requirement(
    total_votes: u32,
    total_contributors: u32, 
    quorum_percentage: u8
) -> bool {
    if total_contributors == 0 {
        return false;
    }
    
    // Calculate minimum required votes (with rounding up)
    let min_required_votes = ((total_contributors as u64 * quorum_percentage as u64) + 99) / 100;
    
    total_votes >= min_required_votes as u32
}

// Calculate if a proposal has reached the required threshold
pub fn has_reached_threshold(
    votes_for: u32,
    votes_against: u32,
    threshold_percentage: u8,
) -> bool {
    if votes_for == 0 {
        return false;
    }
    
    let total_votes = votes_for.saturating_add(votes_against);
    if total_votes == 0 {
        return false;
    }
    
    let approval_percentage = (votes_for as u64 * 100) / (total_votes as u64);
    approval_percentage >= threshold_percentage as u64
}

// Check if a proposal has expired
pub fn is_proposal_expired(expires_at: i64) -> Result<bool> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp >= expires_at)
}

// Update proposal status based on votes, quorum, and expiration
pub fn update_proposal_status(
    votes_for: u32,
    votes_against: u32,
    expires_at: i64,
    threshold_percentage: u8,
    total_contributors: u32,
    quorum_percentage: u8
) -> Result<ProposalStatus> {
    // Check if expired
    if is_proposal_expired(expires_at)? {
        return Ok(ProposalStatus::Expired);
    }
    
    let total_votes = votes_for.saturating_add(votes_against);
    
    // Check if quorum is met first
    if !meets_quorum_requirement(total_votes, total_contributors, quorum_percentage) {
        return Ok(ProposalStatus::Active);
    }
    
    // If quorum is met, check if the proposal should be approved or rejected
    
    // Check if approval threshold is met
    if has_reached_threshold(votes_for, votes_against, threshold_percentage) {
        return Ok(ProposalStatus::Approved);
    }
    
    // Rejection logic: If quorum is met, approval threshold is not met, 
    // and there are more votes against than for, mark as rejected
    if votes_against > votes_for {
        return Ok(ProposalStatus::Rejected);
    }
    
    // Otherwise, remain active until more votes come in or it expires
    Ok(ProposalStatus::Active)
}

// Convert days to seconds for validity periods
pub fn days_to_seconds(days: u64) -> i64 {
    (days * 24 * 60 * 60) as i64
}

// Internal utility function to create vault when both task and transfer proposal are approved
pub fn create_vault_internal<'info>(
    task: &mut Box<Account<'info, Task>>,
    task_vault: &mut Box<Account<'info, TaskVault>>,
    transfer_proposal: &TreasuryTransferProposal,
    token_mint: &Box<Account<'info, Mint>>,
    vault_token_account: &Box<Account<'info, TokenAccount>>,
    treasury_token_account: &Box<Account<'info, TokenAccount>>,
    treasury_authority: &AccountInfo<'info>,
    treasury_authority_seeds: &[&[u8]],
    token_program: &Program<'info, token::Token>,
    clock: &Clock,
    project_key: Pubkey,
) -> Result<()> {
    // Initialize the task vault
    task_vault.task = task.key();
    task_vault.token_mint = token_mint.key();
    task_vault.token_account = vault_token_account.key();
    task_vault.amount = transfer_proposal.amount;
    task_vault.assignee = task.assignee;
    task_vault.is_withdrawable = false; // Will be set to true by the assignee when they mark the task as complete
    
    // Update task with vault information
    task.vault = Some(task_vault.key());
    
    // Update task status to Ready
    let old_status = task.status.clone();
    task.status = TaskStatus::Ready;
    
    // Transfer tokens from treasury to the vault
    token::transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            token::Transfer {
                from: treasury_token_account.to_account_info(),
                to: vault_token_account.to_account_info(),
                authority: treasury_authority.to_account_info(),
            },
            &[treasury_authority_seeds],
        ),
        transfer_proposal.amount,
    )?;
    
    // Emit task vault created event
    emit!(TaskVaultCreatedEvent {
        project: project_key,
        task: task.key(),
        vault: task_vault.key(),
        amount: task_vault.amount,
        token_mint: task_vault.token_mint,
        assignee: task.assignee,
        timestamp: clock.unix_timestamp,
    });
    
    // Emit task status change event
    emit!(TaskStatusChangeEvent {
        project: project_key,
        task: task.key(),
        old_status,
        new_status: TaskStatus::Ready,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Task vault created for task: {}", task.title);
    msg!("Transferred {} tokens from treasury to task vault", transfer_proposal.amount);
    msg!("Task status updated to Ready");
    
    Ok(())
}

// Validate threshold percentage is within range (0-100)
pub fn validate_threshold(threshold: u8) -> Result<()> {
    require!(threshold <= 100, VotingError::InvalidThreshold);
    Ok(())
}

// Validate validity period is greater than zero
pub fn validate_validity_period(period: i64) -> Result<()> {
    require!(period > 0, VotingError::InvalidValidityPeriod);
    Ok(())
}

// Calculate expiration timestamp from current time and validity period
pub fn calculate_expiration(validity_period: i64) -> Result<i64> {
    let clock = Clock::get()?;
    Ok(clock.unix_timestamp.saturating_add(validity_period))
}

// Emit contributor proposal event
pub fn emit_contributor_proposal_event(
    organization: Pubkey,
    proposal: Pubkey,
    candidate: Pubkey,
    proposer: Pubkey,
) {
    emit!(ContributorProposalEvent {
        organization,
        proposal,
        candidate,
        proposer,
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
}

// Emit project proposal event
pub fn emit_project_proposal_event(
    organization: Pubkey,
    proposal: Pubkey,
    title: String,
    proposer: Pubkey,
) {
    emit!(ProjectProposalEvent {
        organization,
        proposal,
        title,
        proposer,
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
}

// Emit vote event
pub fn emit_vote_event(
    voter: Pubkey,
    proposal: Pubkey,
    vote_for: bool,
) {
    emit!(VoteEvent {
        voter,
        proposal,
        vote_for,
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
}

// Emit task event
pub fn emit_task_event(
    project: Pubkey,
    task: Pubkey,
    title: String,
    assignee: Pubkey,
) {
    emit!(TaskEvent {
        project,
        task,
        title,
        assignee,
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
}

// Emit project created event
pub fn emit_project_created_event(
    organization: Pubkey,
    proposal: Pubkey,
    project: Pubkey,
    title: String,
    description: String,
    creator: Pubkey,
) {
    emit!(ProjectCreatedEvent {
        organization,
        proposal,
        project,
        title,
        description,
        creator,
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
}

#[event]
pub struct ContributorProposalEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub candidate: Pubkey,
    pub proposer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProjectProposalEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub title: String,
    pub proposer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VoteEvent {
    pub voter: Pubkey,
    pub proposal: Pubkey,
    pub vote_for: bool,
    pub timestamp: i64,
}

#[event]
pub struct TaskEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub title: String,
    pub assignee: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProjectCreatedEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey, 
    pub project: Pubkey,
    pub title: String,
    pub description: String,
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProjectReadyEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub project_address: Pubkey,
    pub timestamp: i64,
}

// This event is now deprecated - projects are created automatically when proposals are approved

#[event]
pub struct TaskVoteEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub timestamp: i64,
}

#[event]
pub struct TaskStatusChangeEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub old_status: TaskStatus,
    pub new_status: TaskStatus,
    pub timestamp: i64,
}

#[event]
pub struct TaskCompletedEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub assignee: Pubkey,
    pub payment_amount: u64,
    pub token_mint: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaskVaultCreatedEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub vault: Pubkey,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub assignee: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaskVaultWithdrawalEnabledEvent {
    pub task: Pubkey,
    pub vault: Pubkey,
    pub assignee: Pubkey,
    pub reviewer: Pubkey, // Add reviewer field to track who approved the withdrawal
    pub timestamp: i64,
}

#[event]
pub struct TaskPaymentEvent {
    pub project: Pubkey,
    pub task: Pubkey,
    pub assignee: Pubkey,
    pub payment_amount: u64,
    pub token_mint: Pubkey,
    pub timestamp: i64,
}

// Using the event defined in treasury.rs

#[event]
pub struct TreasuryTransferVoteEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub timestamp: i64,
}

// Task Proposal related events
#[event]
pub struct TaskProposalEvent {
    pub organization: Pubkey, // Added organization field
    pub project: Pubkey,
    pub proposal: Pubkey,
    pub title: String,
    pub proposer: Pubkey,
    pub assignee: Pubkey,
    pub payment_amount: u64,
    pub token_mint: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TaskProposalVoteEvent {
    pub organization: Pubkey, // Added organization field
    pub project: Pubkey,
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub timestamp: i64,
}

#[event]
pub struct TaskCreatedFromProposalEvent {
    pub organization: Pubkey, // Added organization field
    pub project: Pubkey,
    pub proposal: Pubkey,
    pub task: Pubkey,
    pub title: String,
    pub assignee: Pubkey,
    pub payment_amount: u64,
    pub timestamp: i64,
}
