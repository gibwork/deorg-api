use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_lang::solana_program::program_pack::Pack;
use anchor_spl::token::{self, Mint, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::VotingError;
use crate::utils::*;

#[derive(Accounts)]
pub struct InitializeTreasuryRegistry<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        constraint = organization.creator == authority.key() @ VotingError::UnauthorizedOrganizationUpdate
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + TreasuryTokenRegistry::MAX_SIZE,
        seeds = [
            b"treasury_registry",
            organization.key().as_ref()
        ],
        bump
    )]
    pub token_registry: Account<'info, TreasuryTokenRegistry>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterTreasuryToken<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        constraint = organization.creator == authority.key() || 
                    organization.contributors.contains(&authority.key()) @ VotingError::UnauthorizedOrganizationUpdate
    )]
    pub organization: Account<'info, Organization>,
    
    /// CHECK: This account will be created and initialized in the instruction handler
    #[account(mut)]
    pub treasury_token_account: UncheckedAccount<'info>,
    
    pub token_mint: Account<'info, Mint>,
    
    /// CHECK: This is the PDA that will have authority over the treasury
    #[account(
        seeds = [
            b"treasury_authority",
            organization.key().as_ref()
        ],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [
            b"treasury_registry",
            organization.key().as_ref()
        ],
        bump
    )]
    pub token_registry: Account<'info, TreasuryTokenRegistry>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(amount: u64, description: String, token_mint: Pubkey, nonce: u64)]
pub struct ProposeFundsTransfer<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    #[account(mut)]
    pub organization: Account<'info, Organization>,
    
    // Token registry to verify the token is registered
    #[account(
        seeds = [
            b"treasury_registry",
            organization.key().as_ref()
        ],
        bump
    )]
    pub token_registry: Account<'info, TreasuryTokenRegistry>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + TreasuryTransferProposal::MAX_SIZE,
        seeds = [
            b"treasury_transfer", 
            organization.key().as_ref(),
            token_mint.as_ref(),
            &amount.to_le_bytes(),
            proposer.key().as_ref(),
            // Use the nonce parameter from the client to ensure uniqueness
            &nonce.to_le_bytes() // The client will provide a unique nonce (timestamp)
        ],
        bump
    )]
    pub proposal: Account<'info, TreasuryTransferProposal>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == token_mint,
        constraint = treasury_token_account.owner == treasury_authority.key()
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the PDA that has authority over the treasury
    #[account(
        seeds = [
            b"treasury_authority",
            organization.key().as_ref()
        ],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,
    
    #[account(
        constraint = destination_token_account.mint == token_mint @ VotingError::InvalidTokenMint,
        owner = token::ID @ VotingError::InvalidTokenAccount
    )]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    #[account(
        constraint = proposer_token_account.owner == proposer.key() @ VotingError::InvalidTokenAccount,
        constraint = proposer_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct VoteOnFundsTransferProposal<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub organization: Box<Account<'info, Organization>>,
    
    #[account(
        mut,
        constraint = proposal.organization == organization.key(),
        constraint = proposal.status == ProposalStatus::Active @ VotingError::ProposalNotActive
    )]
    pub proposal: Box<Account<'info, TreasuryTransferProposal>>,
    
    // Add linked task to enable bi-directional vote synchronization
    #[account(
        mut
    )]
    pub linked_task: Option<Box<Account<'info, Task>>>,
    
    // We need the project for task approval threshold
    pub project: Option<Box<Account<'info, Project>>>,
    
    #[account(
        constraint = voter_token_account.owner == voter.key() @ VotingError::InvalidTokenAccount,
        constraint = voter_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub voter_token_account: Box<Account<'info, TokenAccount>>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == proposal.token_mint,
        constraint = treasury_token_account.owner == treasury_authority.key()
    )]
    pub treasury_token_account: Box<Account<'info, TokenAccount>>,
    
    /// CHECK: This is the PDA that has authority over the treasury
    #[account(
        seeds = [
            b"treasury_authority",
            organization.key().as_ref()
        ],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = destination_token_account.mint == proposal.token_mint,
        constraint = destination_token_account.key() == proposal.destination,
        owner = token::ID @ VotingError::InvalidTokenAccount
    )]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,
    
    // The token mint for the vault
    #[account(
        constraint = token_mint.key() == proposal.token_mint @ VotingError::InvalidTokenMint
    )]
    pub token_mint: Box<Account<'info, Mint>>,
    
    // Accounts for automatic vault creation when both task and proposal are approved
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + TaskVault::MAX_SIZE,
        seeds = [
            b"task_vault", 
            linked_task.as_ref().map_or_else(Pubkey::default, |t| t.key()).as_ref()
        ],
        bump
    )]
    pub task_vault: Option<Box<Account<'info, TaskVault>>>,
    
    #[account(
        init_if_needed,
        payer = voter,
        token::mint = token_mint,
        token::authority = vault_authority,
        seeds = [
            b"vault_token_account", 
            linked_task.as_ref().map_or_else(Pubkey::default, |t| t.key()).as_ref()
        ],
        bump
    )]
    pub vault_token_account: Option<Box<Account<'info, TokenAccount>>>,
    
    /// CHECK: This is the PDA that has authority over the task vault
    #[account(
        seeds = [
            b"vault_authority",
            linked_task.as_ref().map_or_else(Pubkey::default, |t| t.key()).as_ref()
        ],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExecuteFundsTransfer<'info> {
    #[account(mut)]
    pub executor: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        constraint = proposal.organization == organization.key(),
        constraint = proposal.status == ProposalStatus::Approved @ VotingError::ProposalNotApproved
    )]
    pub proposal: Account<'info, TreasuryTransferProposal>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == proposal.token_mint,
        constraint = treasury_token_account.owner == treasury_authority.key()
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Verified through constraints
    #[account(
        seeds = [
            b"treasury_authority",
            organization.key().as_ref()
        ],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = destination_token_account.mint == proposal.token_mint,
        constraint = destination_token_account.key() == proposal.destination
    )]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, token::Token>,
}

#[derive(Accounts)]
pub struct DepositToTreasury<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    // Get token registry to verify token is registered
    #[account(
        seeds = [
            b"treasury_registry",
            organization.key().as_ref()
        ],
        bump
    )]
    pub token_registry: Account<'info, TreasuryTokenRegistry>,
    
    #[account(
        mut,
        constraint = treasury_token_account.mint == token_mint.key(),
        constraint = treasury_token_account.owner == treasury_authority.key()
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    /// CHECK: This is the PDA that has authority over the treasury
    #[account(
        seeds = [
            b"treasury_authority",
            organization.key().as_ref()
        ],
        bump
    )]
    pub treasury_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = depositor_token_account.owner == depositor.key(),
        constraint = depositor_token_account.mint == token_mint.key()
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, token::Token>,
}

// Instruction implementations
pub fn initialize_treasury_registry(ctx: Context<InitializeTreasuryRegistry>) -> Result<()> {
    let registry = &mut ctx.accounts.token_registry;
    registry.organization = ctx.accounts.organization.key();
    registry.token_accounts = Vec::new();
    
    msg!("Treasury registry initialized for organization: {}", ctx.accounts.organization.key());
    
    Ok(())
}

pub fn register_treasury_token(
    ctx: Context<RegisterTreasuryToken>,
) -> Result<()> {
    // Calculate the rent required for a token account
    let rent = &Rent::get()?;
    let space = anchor_spl::token::spl_token::state::Account::LEN;
    let lamports = rent.minimum_balance(space);
    
    // Step 1: Create the account using the System Program
    invoke(
        &system_instruction::create_account(
            ctx.accounts.authority.key,
            ctx.accounts.treasury_token_account.key,
            lamports,
            space as u64,
            &ctx.accounts.token_program.key(),
        ),
        &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.treasury_token_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    
    // Step 2: Initialize the token account
    invoke(
        &anchor_spl::token::spl_token::instruction::initialize_account(
            &ctx.accounts.token_program.key(),
            &ctx.accounts.treasury_token_account.key(),
            &ctx.accounts.token_mint.key(),
            &ctx.accounts.treasury_authority.key(),
        )?,
        &[
            ctx.accounts.treasury_token_account.to_account_info(),
            ctx.accounts.token_mint.to_account_info(),
            ctx.accounts.treasury_authority.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
    )?;
    
    // Get the token mint and account
    let token_mint = ctx.accounts.token_mint.key();
    let token_account = ctx.accounts.treasury_token_account.key();
    
    // Add the token to the registry
    let registry = &mut ctx.accounts.token_registry;
    
    // Check if maximum tokens reached
    require!(
        registry.token_accounts.len() < 20, // Based on MAX_SIZE calculation
        VotingError::MaximumTokensReached
    );
    
    // Check if the token is already registered
    let existing_token = registry.token_accounts.iter()
        .position(|account| account.mint == token_mint);
    
    if let Some(index) = existing_token {
        // Update the existing entry if the mint already exists
        registry.token_accounts[index].token_account = token_account;
        registry.token_accounts[index].is_active = true;
    } else {
        // Add a new entry if this is a new mint
        registry.token_accounts.push(TreasuryTokenAccount {
            mint: token_mint,
            token_account: token_account,
            is_active: true,
        });
    }
    
    // Emit event for the token registration
    emit!(TreasuryTokenRegisteredEvent {
        organization: ctx.accounts.organization.key(),
        mint: token_mint,
        token_account,
        registrar: ctx.accounts.authority.key(),
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
    
    msg!("Treasury token registered: mint={}, account={}", 
        token_mint, 
        token_account
    );
    
    Ok(())
}

pub fn propose_funds_transfer(
    ctx: Context<ProposeFundsTransfer>,
    amount: u64,
    description: String,
    token_mint: Pubkey,
    nonce: u64,
) -> Result<()> {
    // Get key account identities and all required values first
    let proposer = ctx.accounts.proposer.key();
    let organization_key = ctx.accounts.organization.key();
    let organization = &ctx.accounts.organization;
    let treasury_token_account = &ctx.accounts.treasury_token_account;
    
    msg!("Creating proposal with nonce: {}", nonce);
    let destination = ctx.accounts.destination_token_account.key();
    let transfer_proposal_validity_period = organization.treasury_transfer_proposal_validity_period;
    
    // Check validations
    {
        // Check if proposer is a valid contributor
        let is_proposer_contributor = is_valid_contributor(organization, proposer)?;
        require!(
            is_proposer_contributor,
            VotingError::InvalidContributor
        );
        
        // Check if proposer has enough tokens to vote
        let has_enough_tokens = has_enough_tokens_to_vote(&ctx.accounts.proposer_token_account, organization)?;
        require!(
            has_enough_tokens,
            VotingError::InsufficientTokenBalance
        );
        
        // Check if treasury has enough tokens for the transfer
        require!(
            treasury_token_account.amount >= amount,
            VotingError::InsufficientBalance
        );
        
        // Verify the token is registered in the registry
        let registry = &ctx.accounts.token_registry;
        let token_registered = registry.token_accounts.iter()
            .any(|account| account.mint == token_mint && account.is_active);
            
        require!(
            token_registered,
            VotingError::TokenNotRegistered
        );
    }
    
    // Initialize the proposal
    let proposal = &mut ctx.accounts.proposal;
    let clock = Clock::get()?;
    
    proposal.organization = organization_key;
    proposal.proposer = proposer;
    proposal.token_mint = token_mint;
    proposal.amount = amount;
    proposal.destination = destination;
    proposal.created_at = clock.unix_timestamp;
    proposal.expires_at = clock.unix_timestamp.saturating_add(transfer_proposal_validity_period);
    proposal.votes_for = 1; // Proposer's vote is automatically counted
    proposal.votes_against = 0;
    proposal.voters = vec![proposer];
    proposal.status = ProposalStatus::Active;
    proposal.description = description;
    
    // Emit event for the transfer proposal
    emit!(TreasuryTransferProposalEvent {
        organization: organization_key,
        proposal: proposal.key(),
        amount,
        token_mint,
        destination,
        proposer,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Treasury funds transfer proposal created for amount: {} of token: {}", 
        amount, 
        token_mint
    );
    
    Ok(())
}

pub fn vote_on_funds_transfer_proposal(
    ctx: Context<VoteOnFundsTransferProposal>,
    vote: bool,
) -> Result<()> {
    // Get all key account identities and required values first
    let voter = ctx.accounts.voter.key();
    let organization = &ctx.accounts.organization;
    let clock = Clock::get()?;
    
    // Copy necessary data from proposal to local variables
    let proposal_organization = ctx.accounts.proposal.organization;
    let proposal_proposer = ctx.accounts.proposal.proposer;
    let proposal_status = ctx.accounts.proposal.status.clone();
    let proposal_expires_at = ctx.accounts.proposal.expires_at;
    let proposal_created_at = ctx.accounts.proposal.created_at;
    let proposal_voters = ctx.accounts.proposal.voters.clone();
    let proposal_votes_for = ctx.accounts.proposal.votes_for;
    let proposal_votes_against = ctx.accounts.proposal.votes_against;
    let proposal_amount = ctx.accounts.proposal.amount;
    let proposal_token_mint = ctx.accounts.proposal.token_mint;
    let proposal_destination = ctx.accounts.proposal.destination;
    let proposal_description = ctx.accounts.proposal.description.clone();
    
    // Now get a mutable reference to proposal
    let proposal = &mut ctx.accounts.proposal;
    
    // Check validations
    {
        // Check if voter is a valid contributor
        let is_voter_contributor = is_valid_contributor(organization, voter)?;
        require!(
            is_voter_contributor,
            VotingError::InvalidContributor
        );
        
        // Check if voter has enough tokens
        let has_enough_tokens = has_enough_tokens_to_vote(&ctx.accounts.voter_token_account, organization)?;
        require!(
            has_enough_tokens,
            VotingError::InsufficientTokenBalance
        );
        
        // Check if voter has already voted on the proposal
        let already_voted_on_proposal = proposal_voters.contains(&voter);
        
        // Check if the proposal has expired
        let is_expired = is_proposal_expired(proposal_expires_at)?;
        require!(
            !is_expired,
            VotingError::ProposalExpired
        );
        
        // If there's a linked task, check if the voter has already voted on it
        let already_voted_on_task = if let Some(task) = &ctx.accounts.linked_task {
            task.voters.contains(&voter)
        } else {
            false
        };
        
        // Ensure the voter hasn't voted on either the proposal or the linked task
        require!(
            !already_voted_on_proposal && !already_voted_on_task,
            VotingError::AlreadyVoted
        );
    }
    
    // Record vote on the proposal
    if vote {
        proposal.votes_for += 1;
    } else {
        proposal.votes_against += 1;
    }
    
    // Add voter to the proposal's voters list
    proposal.voters.push(voter);
    
    // If there's a linked task, synchronize the vote
    if let Some(task) = &mut ctx.accounts.linked_task {
        // Verify that the task is in the Proposed state and can receive votes
        if task.status == TaskStatus::Proposed {
            // Record the same vote on the task
            if vote {
                task.votes_for += 1;
            } else {
                task.votes_against += 1;
            }
            
            // Add voter to the task's voters list
            task.voters.push(voter);
            
            // Check if task meets approval threshold
            if let Some(project) = &ctx.accounts.project {
                let total_task_votes = task.votes_for.saturating_add(task.votes_against);
                let task_approval_percentage = if total_task_votes > 0 {
                    (task.votes_for as u64 * 100) / (total_task_votes as u64)
                } else {
                    0
                };
                
                // Update task status based on votes
                let task_approved = task_approval_percentage >= project.task_approval_threshold as u64;
                let task_rejected = task.votes_against > task.votes_for && 
                                   task.voters.len() as u32 >= project.members.len() as u32 / 2;
                
                if task_approved {
                    if task.status == TaskStatus::Proposed {
                        task.status = TaskStatus::Approved;
                        msg!("Linked task approved: {}", task.title);
                        
                        // Emit task status change event
                        emit!(crate::utils::TaskStatusChangeEvent {
                            project: project.key(),
                            task: task.key(),
                            old_status: TaskStatus::Proposed,
                            new_status: TaskStatus::Approved,
                            timestamp: clock.unix_timestamp,
                        });
                    }
                } else if task_rejected {
                    task.status = TaskStatus::Rejected;
                    msg!("Linked task rejected: {}", task.title);
                    
                    // Emit task status change event
                    emit!(crate::utils::TaskStatusChangeEvent {
                        project: project.key(),
                        task: task.key(),
                        old_status: TaskStatus::Proposed,
                        new_status: TaskStatus::Rejected,
                        timestamp: clock.unix_timestamp,
                    });
                }
                
                // Emit task vote event
                emit!(crate::utils::TaskVoteEvent {
                    project: project.key(),
                    task: task.key(),
                    voter,
                    vote,
                    timestamp: clock.unix_timestamp,
                });
                
                msg!("Vote synchronized with linked task. Task votes: For={}, Against={}",
                    task.votes_for,
                    task.votes_against
                );
            }
        }
    }
    
    // Update proposal status
    let new_status = update_proposal_status(
        proposal_votes_for,
        proposal_votes_against,
        proposal_expires_at,
        organization.treasury_transfer_threshold_percentage,
        organization.contributors.len() as u32,
        organization.treasury_transfer_quorum_percentage,
    )?;
    
    // Check if the status changed to Approved
    let was_approved = new_status == ProposalStatus::Approved && proposal_status != ProposalStatus::Approved;
    let is_approved = new_status == ProposalStatus::Approved;
    
    // Update the status
    proposal.status = new_status;
    
    // Emit vote event for the proposal
    emit_vote_event(
        voter,
        proposal.key(),
        vote,
    );
    
    // Log vote results
    msg!("Vote recorded. Transfer proposal votes: For={}, Against={}",
        proposal.votes_for,
        proposal.votes_against
    );
    
    // Check if both the proposal and task are approved
    let mut both_approved = false;
    if was_approved && is_approved {
        if let (Some(task), Some(project)) = (&ctx.accounts.linked_task, &ctx.accounts.project) {
            if task.status == TaskStatus::Approved {
                both_approved = true;
                msg!("Both task and transfer proposal are approved!");
                
                // If we have all required accounts, automatically create the vault
                let token_mint = &ctx.accounts.token_mint;
                
                if let (Some(task_vault), Some(vault_token_account), Some(task_mut)) = 
                    (&mut ctx.accounts.task_vault, &ctx.accounts.vault_token_account, &mut ctx.accounts.linked_task) {
                    msg!("Automatically creating and funding vault...");
                    
                    // Get the treasury authority seeds for signing
                    let treasury_authority = &ctx.accounts.treasury_authority;
                    let treasury_authority_bump = ctx.bumps.treasury_authority;
                    let org_key = ctx.accounts.organization.key();
                    let treasury_authority_seeds = &[
                        b"treasury_authority",
                        org_key.as_ref(),
                        &[treasury_authority_bump],
                    ];
                    
                    // Use proposal data we captured earlier for the vault
                    let transfer_amount = proposal_amount;
                    let token_mint_pubkey = proposal_token_mint;
                    
                    // Create a local copy of proposal for internal function
                    let proposal_copy = TreasuryTransferProposal {
                        organization: proposal_organization,
                        proposer: proposal_proposer,
                        token_mint: token_mint_pubkey,
                        amount: transfer_amount,
                        destination: proposal_destination,
                        created_at: proposal_created_at,
                        expires_at: proposal_expires_at,
                        votes_for: proposal_votes_for,
                        votes_against: proposal_votes_against,
                        status: proposal_status.clone(),
                        voters: proposal_voters.clone(),
                        description: proposal_description.clone(),
                    };
                    
                    // Create the vault using the internal helper function
                    create_vault_internal(
                        task_mut,
                        task_vault,
                        &proposal_copy,
                        token_mint,
                        vault_token_account,
                        &ctx.accounts.treasury_token_account,
                        treasury_authority,
                        treasury_authority_seeds,
                        &ctx.accounts.token_program,
                        &clock,
                        project.key()
                    )?;
                    
                    msg!("Vault created and funded automatically!");
                } else {
                    // If optional accounts not provided, just update the status
                    if let Some(task_mut) = &mut ctx.accounts.linked_task {
                        task_mut.status = TaskStatus::Ready;
                        
                        // Emit task status change event
                        emit!(crate::utils::TaskStatusChangeEvent {
                            project: project.key(),
                            task: task_mut.key(),
                            old_status: TaskStatus::Approved,
                            new_status: TaskStatus::Ready,
                            timestamp: clock.unix_timestamp,
                        });
                        
                        msg!("Task status updated to Ready. Include vault-related accounts to automatically create vault.");
                    }
                }
            }
        }
    }
    
    // If we're not creating a vault, but the proposal was approved, execute the transfer
    if was_approved && !both_approved {
        msg!("Proposal approved, automatically executing transfer...");
        
        // Get the required accounts and values
        let amount = proposal_amount;
        let token_mint = proposal_token_mint;
        let destination = proposal_destination;
        
        // Get the PDA authority and bump seed
        let org_key = organization.key();
        let treasury_authority = &ctx.accounts.treasury_authority;
        // In Anchor, bump is accessed directly from the struct
        let treasury_authority_bump = ctx.bumps.treasury_authority;
        
        // Create the seeds for signing
        let seeds = &[
            b"treasury_authority" as &[u8],
            org_key.as_ref(),
            &[treasury_authority_bump]
        ];
        let signer_seeds = &[&seeds[..]];
        
        // Execute the transfer
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(), 
                token::Transfer {
                    from: ctx.accounts.treasury_token_account.to_account_info(),
                    to: ctx.accounts.destination_token_account.to_account_info(),
                    authority: ctx.accounts.treasury_authority.to_account_info(),
                },
                signer_seeds,
            ),
            amount,
        )?;
        
        // Emit the transfer executed event
        emit!(TreasuryTransferExecutedEvent {
            organization: organization.key(),
            proposal: proposal.key(),
            amount,
            token_mint,
            destination,
            executor: voter,
            timestamp: clock.unix_timestamp,
        });
        
        msg!("Transfer of {} tokens automatically executed to destination {}",
            amount,
            destination
        );
    }
    
    Ok(())
}

pub fn execute_funds_transfer(ctx: Context<ExecuteFundsTransfer>) -> Result<()> {
    // Get all key account identities and required values first
    let organization = &ctx.accounts.organization;
    let proposal = &ctx.accounts.proposal;
    let amount = proposal.amount;
    
    // Verify the executor is a contributor
    let is_executor_contributor = is_valid_contributor(
        organization, 
        ctx.accounts.executor.key()
    )?;
    require!(
        is_executor_contributor,
        VotingError::InvalidContributor
    );
    
    // Execute the token transfer using PDA as authority
    let org_key = ctx.accounts.organization.key();
    let bump = ctx.bumps.treasury_authority;
    let seeds = &[
        b"treasury_authority" as &[u8],
        org_key.as_ref(),
        &[bump]
    ];
    let signer_seeds = &[&seeds[..]];
    
    // Transfer tokens from treasury to destination
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.treasury_token_account.to_account_info(),
                to: ctx.accounts.destination_token_account.to_account_info(),
                authority: ctx.accounts.treasury_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;
    
    // Emit event for the transfer execution
    emit!(TreasuryTransferExecutedEvent {
        organization: organization.key(),
        proposal: proposal.key(),
        amount,
        token_mint: proposal.token_mint,
        destination: ctx.accounts.destination_token_account.key(),
        executor: ctx.accounts.executor.key(),
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
    
    msg!("Executed transfer of {} tokens to destination {}",
        amount,
        ctx.accounts.destination_token_account.key()
    );
    
    Ok(())
}

pub fn deposit_to_treasury(
    ctx: Context<DepositToTreasury>,
    amount: u64,
) -> Result<()> {
    // Verify the token is registered in the registry
    let registry = &ctx.accounts.token_registry;
    let token_mint = ctx.accounts.token_mint.key();
    let token_registered = registry.token_accounts.iter()
        .any(|account| account.mint == token_mint && account.is_active);
        
    require!(
        token_registered,
        VotingError::TokenNotRegistered
    );
    
    // Transfer tokens from depositor to treasury
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.depositor_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.depositor.to_account_info(),
            },
        ),
        amount,
    )?;
    
    // Emit deposit event
    emit!(TreasuryDepositEvent {
        organization: ctx.accounts.organization.key(),
        depositor: ctx.accounts.depositor.key(),
        amount,
        token_mint,
        treasury_token_account: ctx.accounts.treasury_token_account.key(),
        timestamp: Clock::get().unwrap().unix_timestamp,
    });
    
    msg!("Deposited {} tokens to organization treasury",
        amount
    );
    
    Ok(())
}

// Events
#[event]
pub struct TreasuryTokenRegisteredEvent {
    pub organization: Pubkey,
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub registrar: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryTransferProposalEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub destination: Pubkey,
    pub proposer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryTransferExecutedEvent {
    pub organization: Pubkey,
    pub proposal: Pubkey,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub destination: Pubkey,
    pub executor: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TreasuryDepositEvent {
    pub organization: Pubkey,
    pub depositor: Pubkey,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub treasury_token_account: Pubkey,
    pub timestamp: i64,
}
