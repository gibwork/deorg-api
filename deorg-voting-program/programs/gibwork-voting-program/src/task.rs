use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Mint, TokenAccount};
use crate::state::*;
use crate::errors::VotingError;
use crate::utils::*;
use crate::ID;
use std::io::Write;

#[derive(Accounts)]
#[instruction(title: String, description: String, payment_amount: u64, assignee: Pubkey, token_mint: Pubkey)]
pub struct ProposeTask<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        constraint = project.is_active @ VotingError::ProjectExpired,
        constraint = project.organization == organization.key()
    )]
    pub project: Account<'info, Project>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + TaskProposal::MAX_SIZE,
        seeds = [
            b"task_proposal", 
            organization.key().as_ref(), // Added organization as a seed
            project.key().as_ref(), 
            title.as_bytes()
        ],
        bump
    )]
    pub proposal: Account<'info, TaskProposal>,
    
    // Check token accounts
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
        constraint = destination_token_account.owner == assignee @ VotingError::InvalidTokenAccount,
        owner = anchor_spl::token::ID @ VotingError::InvalidTokenAccount
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
pub struct VoteOnTaskProposal<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub organization: Box<Account<'info, Organization>>,
    
    #[account(
        constraint = project.is_active @ VotingError::ProjectExpired,
        constraint = project.organization == organization.key(),
        constraint = project.members.contains(&voter.key()) @ VotingError::UnauthorizedProjectAction
    )]
    pub project: Box<Account<'info, Project>>,
    
    #[account(
        mut,
        constraint = proposal.project == project.key(),
        constraint = proposal.status == ProposalStatus::Active @ VotingError::ProposalNotActive
    )]
    pub proposal: Box<Account<'info, TaskProposal>>,
    
    #[account(
        constraint = voter_token_account.owner == voter.key() @ VotingError::InvalidTokenAccount,
        constraint = voter_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub voter_token_account: Box<Account<'info, TokenAccount>>,
    
    // The treasury token account that will fund the task
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
    
    // Destination account for the task assignee
    #[account(
        mut,
        constraint = destination_token_account.owner == proposal.assignee @ VotingError::InvalidTokenAccount,
        constraint = destination_token_account.mint == proposal.token_mint @ VotingError::InvalidTokenMint,
        constraint = destination_token_account.key() == proposal.destination @ VotingError::InvalidTokenAccount,
        owner = anchor_spl::token::ID
    )]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,
    
    // Accounts for automatic task creation when proposal is approved
    /// CHECK: PDA that will be created in the instruction handler
    #[account(mut)]
    pub task: UncheckedAccount<'info>,
    
    // Accounts for automatic vault creation when both task and proposal are approved
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + TaskVault::MAX_SIZE,
        seeds = [
            b"task_vault", 
            task.key().as_ref()
        ],
        bump
    )]
    pub task_vault: Box<Account<'info, TaskVault>>,
    
    #[account(
        constraint = token_mint.key() == proposal.token_mint @ VotingError::InvalidTokenMint
    )]
    pub token_mint: Box<Account<'info, Mint>>,
    
    #[account(
        init_if_needed,
        payer = voter,
        token::mint = token_mint,
        token::authority = vault_authority,
        seeds = [
            b"vault_token_account", 
            task.key().as_ref()
        ],
        bump
    )]
    pub vault_token_account: Box<Account<'info, TokenAccount>>,
    
    /// CHECK: This is the PDA that has authority over the task vault
    #[account(
        seeds = [
            b"vault_authority",
            task.key().as_ref()
        ],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, anchor_spl::token::Token>,
    pub rent: Sysvar<'info, Rent>,
}


#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub assignee: Signer<'info>,
    
    pub project: Account<'info, Project>,
    
    #[account(
        mut,
        constraint = task.project == project.key(),
        constraint = task.assignee == assignee.key(),
        constraint = task.status == TaskStatus::Ready @ VotingError::InvalidTaskStatus
    )]
    pub task: Account<'info, Task>,
    
    #[account(
        mut,
        constraint = task_vault.task == task.key() @ VotingError::TaskVaultNotFound,
        constraint = task_vault.assignee == assignee.key() @ VotingError::UnauthorizedWithdrawal
    )]
    pub task_vault: Account<'info, TaskVault>,
    
    #[account(
        constraint = assignee_token_account.mint == task_vault.token_mint @ VotingError::InvalidTokenMint,
        constraint = assignee_token_account.owner == assignee.key() @ VotingError::InvalidTokenAccount,
        owner = anchor_spl::token::ID
    )]
    pub assignee_token_account: Account<'info, TokenAccount>,
    
    #[account(
        constraint = vault_token_account.mint == task_vault.token_mint,
        constraint = vault_token_account.owner == vault_authority.key(),
        owner = anchor_spl::token::ID
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the PDA that has authority over the vault
    #[account(
        seeds = [
            b"vault_authority",
            task.key().as_ref()
        ],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub token_program: Program<'info, token::Token>,
}

pub fn propose_task(
    ctx: Context<ProposeTask>,
    title: String,
    description: String,
    payment_amount: u64,
    assignee: Pubkey,
    token_mint: Pubkey,
) -> Result<()> {
    // Get key account identities and all required values
    let proposer = ctx.accounts.proposer.key();
    let project = &ctx.accounts.project;
    let organization = &ctx.accounts.organization;
    let treasury_token_account = &ctx.accounts.treasury_token_account;
    let token_registry = &ctx.accounts.token_registry;
    let destination = ctx.accounts.destination_token_account.key();
    let task_proposal_validity_period = project.validity_end_time - Clock::get()?.unix_timestamp;
    let clock = Clock::get()?;
    
    // Validate inputs
    require!(payment_amount > 0, VotingError::InvalidBudgetAmount);
    
    // Verify the token is registered in the registry
    let token_registered = token_registry.token_accounts.iter()
        .any(|account| account.mint == token_mint && account.is_active);
        
    require!(
        token_registered,
        VotingError::TokenNotRegistered
    );
    
    // Check if treasury has enough tokens for the transfer
    require!(
        treasury_token_account.amount >= payment_amount,
        VotingError::InsufficientBalance
    );
    
    // Check if proposer has enough tokens to vote
    require!(
        has_enough_tokens_to_vote(&ctx.accounts.proposer_token_account, organization)?,
        VotingError::InsufficientTokenBalance
    );
    
    // Initialize the task proposal
    let proposal = &mut ctx.accounts.proposal;
    
    proposal.organization = organization.key();
    proposal.project = project.key();
    proposal.proposer = proposer;
    proposal.title = title.clone();
    proposal.description = description.clone();
    proposal.payment_amount = payment_amount;
    proposal.assignee = assignee;
    proposal.token_mint = token_mint;
    proposal.destination = destination;
    proposal.created_at = clock.unix_timestamp;
    proposal.expires_at = clock.unix_timestamp.saturating_add(task_proposal_validity_period);
    proposal.votes_for = 0; // Proposer's vote is no longer automatically counted
    proposal.votes_against = 0;
    proposal.status = ProposalStatus::Active;
    proposal.voters = vec![]; // No voters initially
    
    // Emit task proposal event
    emit!(TaskProposalEvent {
        organization: organization.key(),
        project: project.key(),
        proposal: proposal.key(),
        title: title.clone(),
        proposer,
        assignee,
        payment_amount,
        token_mint,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Task proposal created: {}", proposal.title);
    
    Ok(())
}

pub fn vote_on_task_proposal(
    ctx: Context<VoteOnTaskProposal>,
    vote: bool,
) -> Result<()> {
    let voter = ctx.accounts.voter.key();
    let project = &ctx.accounts.project;
    let proposal = &mut ctx.accounts.proposal;
    let organization = &ctx.accounts.organization;
    
    // Check if voter has already voted
    let already_voted = proposal.voters.contains(&voter);
    
    // Ensure the voter hasn't voted
    require!(!already_voted, VotingError::AlreadyVoted);
    
    // Check if the proposal has expired
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp <= proposal.expires_at,
        VotingError::ProposalExpired
    );
    
    // Check if treasury still has enough funds
    require!(
        ctx.accounts.treasury_token_account.amount >= proposal.payment_amount,
        VotingError::InsufficientBalance
    );
    
    // Check if voter has enough tokens to vote
    require!(
        has_enough_tokens_to_vote(&ctx.accounts.voter_token_account, organization)?,
        VotingError::InsufficientTokenBalance
    );
    
    // Record vote
    if vote {
        proposal.votes_for += 1;
    } else {
        proposal.votes_against += 1;
    }
    proposal.voters.push(voter);
    
    // Check if threshold is met for approval
    let total_votes = proposal.votes_for.saturating_add(proposal.votes_against);
    let approval_percentage = if total_votes > 0 {
        (proposal.votes_for as u64 * 100) / (total_votes as u64)
    } else {
        0
    };
    
    // Update proposal status based on votes
    let proposal_approved = approval_percentage >= project.task_approval_threshold as u64;
    let proposal_rejected = proposal.votes_against > proposal.votes_for && 
                           proposal.voters.len() as u32 >= project.members.len() as u32 / 2;
    
    let current_status = proposal.status.clone();
    
    // Update statuses
    if proposal_approved {
        if proposal.status == ProposalStatus::Active {
            proposal.status = ProposalStatus::Approved;
            msg!("Task proposal approved: {}", proposal.title);
        }
    } else if proposal_rejected {
        proposal.status = ProposalStatus::Rejected;
        msg!("Task proposal rejected: {}", proposal.title);
    }
    
    // Check if proposal became approved
    let became_approved = proposal.status == ProposalStatus::Approved && current_status != ProposalStatus::Approved;
    
    // If proposal just became approved, create the task and vault automatically
    if became_approved {
        // Calculate PDA for task and its bump
        let (task_address, task_bump) = Pubkey::find_program_address(
            &[
                b"task",
                organization.key().as_ref(),  // Added organization as a seed
                project.key().as_ref(),
                proposal.title.as_bytes()
            ],
            ctx.program_id
        );
        
        // Verify the task account matches the expected PDA
        require!(
            ctx.accounts.task.key() == task_address,
            VotingError::InvalidTaskAccount
        );
        
        // Store the keys and title to avoid temporary value issue
        let org_key = organization.key();
        let project_key = project.key();
        let title_bytes = proposal.title.as_bytes();
        
        // Create task account using seeds and bump
        let task_seeds = &[
            b"task", 
            org_key.as_ref(),
            project_key.as_ref(), 
            title_bytes,
            &[task_bump]
        ];
        
        // Create the task account with more explicit error handling
        let task_space = 8 + Task::MAX_SIZE;
        let task_lamports = Rent::get()?.minimum_balance(task_space);
        let create_task_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::CreateAccount {
                from: ctx.accounts.voter.to_account_info(),
                to: ctx.accounts.task.to_account_info(),
            },
        );
        
        msg!("Creating task account with space: {}", task_space);
        
        system_program::create_account(
            create_task_ctx.with_signer(&[task_seeds]),
            task_lamports,
            task_space as u64,
            ctx.program_id,
        )?;
        
        msg!("Task account created successfully");
        
        // Initialize the task directly
        let task_info = Task {
            project: project.key(),
            assignee: proposal.assignee,
            status: TaskStatus::Approved, // Start as Approved
            title: proposal.title.clone(),
            description: proposal.description.clone(),
            payment_amount: proposal.payment_amount,
            votes_for: proposal.votes_for,
            votes_against: proposal.votes_against,
            voters: proposal.voters.clone(),
            transfer_proposal: None, // We don't create a separate transfer proposal
            vault: None, // Will be set during vault creation
            reviewer: None, // Will be set when a reviewer approves the task
        };
        
        // Initialize the Task account with its data and discriminator
        {
            let task_account = ctx.accounts.task.to_account_info();
            let mut data = task_account.try_borrow_mut_data()?;
            
            // Create a cursor to write to the account data
            let mut cursor = std::io::Cursor::new(&mut data[..]);
            
            // Use the correct Anchor discriminator for Task
            let discriminator = anchor_lang::solana_program::hash::hash(b"account:Task").to_bytes()[..8].to_vec();
            cursor.write_all(&discriminator)?;
            
            // Serialize the task info
            task_info.serialize(&mut cursor)?;
            
            msg!("Task account initialized");
        } // task_account is dropped here
        
        // Emit task created event
        emit!(TaskCreatedFromProposalEvent {
            organization: organization.key(),
            project: project.key(),
            proposal: proposal.key(),
            task: task_address,
            title: task_info.title.clone(),
            assignee: task_info.assignee,
            payment_amount: task_info.payment_amount,
            timestamp: clock.unix_timestamp,
        });
        
        msg!("Task automatically created from approved proposal: {}", proposal.title);
        
        // Now create and fund the vault
        let task_vault = &mut ctx.accounts.task_vault;
        let vault_token_account = &ctx.accounts.vault_token_account;
        let treasury_token_account = &ctx.accounts.treasury_token_account;
        let treasury_authority = &ctx.accounts.treasury_authority;
        let token_mint = &ctx.accounts.token_mint;
        
        // Get the treasury authority seeds for signing
        let treasury_authority_bump = ctx.bumps.treasury_authority;
        let org_key = organization.key();
        let treasury_authority_seeds = &[
            b"treasury_authority",
            org_key.as_ref(),
            &[treasury_authority_bump],
        ];
        
        // Initialize the task vault
        task_vault.task = task_address;
        task_vault.token_mint = token_mint.key();
        task_vault.token_account = vault_token_account.key();
        task_vault.amount = proposal.payment_amount;
        task_vault.assignee = proposal.assignee;
        task_vault.is_withdrawable = false;
        
        // Transfer tokens from treasury to vault
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: treasury_token_account.to_account_info(),
                    to: vault_token_account.to_account_info(),
                    authority: treasury_authority.to_account_info(),
                },
                &[treasury_authority_seeds],
            ),
            proposal.payment_amount,
        )?;
        
        // Update the task status now that transfer is complete
        {
            // Create a new Task struct with the updated status and vault
            let updated_task = Task {
                project: project.key(),
                assignee: proposal.assignee,
                status: TaskStatus::Ready,
                title: proposal.title.clone(),
                description: proposal.description.clone(),
                payment_amount: proposal.payment_amount,
                votes_for: proposal.votes_for,
                votes_against: proposal.votes_against,
                voters: proposal.voters.clone(),
                transfer_proposal: None,
                vault: Some(task_vault.key()),
                reviewer: None, // Will be set when a reviewer approves the task
            };
            
            // Get a fresh reference to the task account
            let task_account = ctx.accounts.task.to_account_info();
            let mut data = task_account.try_borrow_mut_data()?;
            
            // Rewrite the entire account data
            let mut cursor = std::io::Cursor::new(&mut data[..]);
            
            // Use the same discriminator for consistency
            let discriminator = anchor_lang::solana_program::hash::hash(b"account:Task").to_bytes()[..8].to_vec();
            cursor.write_all(&discriminator)?;
            
            // Serialize the updated task
            updated_task.serialize(&mut cursor)?;
            
            msg!("Task updated to Ready status");
        }
        
        // Emit vault created event
        emit!(TaskVaultCreatedEvent {
            project: project.key(),
            task: task_address,
            vault: task_vault.key(),
            amount: task_vault.amount,
            token_mint: task_vault.token_mint,
            assignee: proposal.assignee,
            timestamp: clock.unix_timestamp,
        });
        
        // Emit status change event
        emit!(TaskStatusChangeEvent {
            project: project.key(),
            task: task_address,
            old_status: TaskStatus::Approved,
            new_status: TaskStatus::Ready,
            timestamp: clock.unix_timestamp,
        });
        
        msg!("Task vault created and funded automatically!");
    }
    
    // Emit vote event
    emit!(TaskProposalVoteEvent {
        organization: organization.key(),
        project: project.key(),
        proposal: proposal.key(),
        voter,
        vote,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Vote recorded. Current votes: For={}, Against={}", 
        proposal.votes_for, 
        proposal.votes_against
    );
    
    Ok(())
}

pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let task_vault = &mut ctx.accounts.task_vault;
    let project = &ctx.accounts.project;
    
    // Check if task is in Ready status (has a funded vault)
    require!(
        task.status == TaskStatus::Ready,
        VotingError::InvalidTaskStatus
    );
    
    // Get the clock for the timestamp
    let clock = Clock::get()?;
    
    // Update task status to Completed - no funds transfer yet
    task.status = TaskStatus::Completed;
    
    // Emit task status change event
    emit!(crate::utils::TaskStatusChangeEvent {
        project: project.key(),
        task: task.key(),
        old_status: TaskStatus::Ready,
        new_status: TaskStatus::Completed,
        timestamp: clock.unix_timestamp,
    });
    
    // Emit task completed event
    emit!(crate::utils::TaskCompletedEvent {
        project: project.key(),
        task: task.key(),
        assignee: task.assignee,
        payment_amount: task_vault.amount,
        token_mint: task_vault.token_mint,
        timestamp: clock.unix_timestamp,
    });
    
    msg!("Task marked as completed: {}", task.title);
    msg!("Task now requires review from another project member to enable payment withdrawal");
    
    Ok(())
}


#[derive(Accounts)]
#[instruction()]
pub struct EnableTaskVaultWithdrawal<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,

    pub project: Account<'info, Project>,

    #[account(
        mut,
        constraint = task.project == project.key(),
        // Require the task to be in Completed status
        constraint = task.status == TaskStatus::Completed @ VotingError::TaskNotCompleted,
        // Ensure reviewer is different from assignee
        constraint = task.assignee != reviewer.key() @ VotingError::ReviewerCannotBeAssignee,
        // Ensure reviewer is a project member
        constraint = project.members.contains(&reviewer.key()) @ VotingError::UnauthorizedProjectAction,
        constraint = task.vault.is_some() @ VotingError::TaskVaultNotFound
    )]
    pub task: Account<'info, Task>,

    #[account(
        mut,
        constraint = task_vault.task == task.key() @ VotingError::TaskVaultNotFound,
        constraint = task_vault.is_withdrawable == false @ VotingError::WithdrawalAlreadyEnabled
    )]
    pub task_vault: Account<'info, TaskVault>,

    #[account(
        mut,
        constraint = assignee_token_account.mint == task_vault.token_mint @ VotingError::InvalidTokenMint,
        constraint = assignee_token_account.owner == task.assignee @ VotingError::InvalidTokenAccount,
        owner = anchor_spl::token::ID
    )]
    pub assignee_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = vault_token_account.mint == task_vault.token_mint,
        constraint = vault_token_account.owner == vault_authority.key(),
        owner = anchor_spl::token::ID
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// CHECK: This is the PDA that has authority over the vault
    #[account(
        seeds = [
            b"vault_authority",
            task.key().as_ref()
        ],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,

    pub token_program: Program<'info, token::Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn enable_task_vault_withdrawal(ctx: Context<EnableTaskVaultWithdrawal>) -> Result<()> {
    let task = &mut ctx.accounts.task;
    let task_vault = &mut ctx.accounts.task_vault;
    let reviewer = ctx.accounts.reviewer.key();
    let clock = Clock::get()?;

    // Set the reviewer field in the task
    task.reviewer = Some(reviewer);

    // Enable withdrawal from the vault
    task_vault.is_withdrawable = true;

    // Get the vault authority seeds for signing
    let vault_authority = &ctx.accounts.vault_authority;
    let task_key = task.key();
    let seeds = &[
        b"vault_authority",
        task_key.as_ref(),
    ];
    let (_, vault_authority_bump) = Pubkey::find_program_address(seeds, &ID);
    let vault_authority_seeds = &[
        b"vault_authority",
        task_key.as_ref(),
        &[vault_authority_bump],
    ];
    let signer_seeds = &[&vault_authority_seeds[..]];

    // Save the old task status for events
    let old_status = task.status.clone();

    // Automatically transfer tokens from vault to assignee
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.assignee_token_account.to_account_info(),
                authority: vault_authority.to_account_info(),
            },
            signer_seeds,
        ),
        task_vault.amount,
    )?;

    // Update task status to Paid
    task.status = TaskStatus::Paid;

    // Emit task status change event
    emit!(crate::utils::TaskStatusChangeEvent {
        project: ctx.accounts.project.key(),
        task: task.key(),
        old_status,
        new_status: TaskStatus::Paid,
        timestamp: clock.unix_timestamp,
    });

    // Emit task payment event
    emit!(crate::utils::TaskPaymentEvent {
        project: ctx.accounts.project.key(),
        task: task.key(),
        assignee: task.assignee,
        payment_amount: task_vault.amount,
        token_mint: task_vault.token_mint,
        timestamp: clock.unix_timestamp,
    });

    // Emit vault withdrawal enabled event (for backward compatibility)
    emit!(crate::utils::TaskVaultWithdrawalEnabledEvent {
        task: task.key(),
        vault: task_vault.key(),
        assignee: task.assignee,  // Keep the assignee information
        reviewer: reviewer,       // Add reviewer information
        timestamp: clock.unix_timestamp,
    });

    msg!("Payment of {} tokens has been automatically transferred to the assignee", task_vault.amount);
    msg!("Task status updated to Paid");

    Ok(())
}

