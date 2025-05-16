use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::TokenAccount;
use crate::state::*;
use crate::errors::VotingError;
use crate::utils::*;
use std::io::{Cursor, Write};

// Helper function to get a UUID from a proposal public key
fn get_uuid_from_pubkey(pubkey: &Pubkey) -> [u8; 16] {
    let pubkey_bytes = pubkey.to_bytes();
    let mut uuid = [0u8; 16];
    uuid.copy_from_slice(&pubkey_bytes[0..16]);
    uuid
}

#[derive(Accounts)]
#[instruction(project_uuid: [u8; 16])]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        constraint = proposal.organization == organization.key(),
        constraint = proposal.status == ProposalStatus::Approved @ VotingError::ProposalNotApproved
    )]
    pub proposal: Account<'info, ProjectProposal>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Project::MAX_SIZE,
        seeds = [
            b"project", 
            organization.key().as_ref(), 
            project_uuid.as_ref()
        ],
        bump
    )]
    pub project: Account<'info, Project>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, description: String, member_pubkeys: Vec<Pubkey>, task_approval_threshold: u8, validity_period: i64)]
pub struct ProposeProject<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + ProjectProposal::MAX_SIZE,
        seeds = [
            b"project_proposal", 
            organization.key().as_ref(), 
            title.as_bytes()
        ],
        bump
    )]
    pub proposal: Account<'info, ProjectProposal>,
    
    #[account(
        constraint = proposer_token_account.owner == proposer.key() @ VotingError::InvalidTokenAccount,
        constraint = proposer_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnProjectProposal<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        constraint = proposal.organization == organization.key(),
        constraint = proposal.status == ProposalStatus::Active @ VotingError::ProposalNotActive
    )]
    pub proposal: Account<'info, ProjectProposal>,
    
    #[account(
        constraint = voter_token_account.owner == voter.key() @ VotingError::InvalidTokenAccount,
        constraint = voter_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is initialized when a proposal is approved
    #[account(mut)]
    pub project: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn propose_project(
    ctx: Context<ProposeProject>,
    title: String,
    description: String,
    member_pubkeys: Vec<Pubkey>,
    task_approval_threshold: u8,
    validity_period: i64,
) -> Result<()> {
    // First collect all the data we need to avoid borrowing issues
    let proposer = ctx.accounts.proposer.key();
    let organization_key = ctx.accounts.organization.key();
    let organization = &ctx.accounts.organization;
    let proposal_info = ctx.accounts.proposal.to_account_info();
    let proposal_key = proposal_info.key();
    let clock = Clock::get()?;
    let project_proposal_validity_period = organization.project_proposal_validity_period;
    
    // Validate inputs
    validate_threshold(task_approval_threshold)?;
    validate_validity_period(validity_period)?;
    
    // Verify the proposer is a valid contributor
    require!(
        is_valid_contributor(organization, proposer)?,
        VotingError::InvalidContributor
    );
    
    // Check if proposer has enough tokens
    require!(
        has_enough_tokens_to_vote(&ctx.accounts.proposer_token_account, organization)?,
        VotingError::InsufficientTokenBalance
    );
    
    // Verify all member_pubkeys are valid contributors
    for member in &member_pubkeys {
        require!(
            is_valid_contributor(organization, *member)?,
            VotingError::InvalidContributor
        );
    }
    
    // Now that we have all the data we need, initialize the proposal
    let proposal = &mut ctx.accounts.proposal;
    
    proposal.organization = organization_key;
    proposal.proposer = proposer;
    proposal.title = title.clone();
    proposal.description = description.clone();
    proposal.member_pubkeys = member_pubkeys;
    proposal.task_approval_threshold = task_approval_threshold;
    proposal.validity_period = validity_period;
    proposal.created_at = clock.unix_timestamp;
    proposal.expires_at = clock.unix_timestamp.saturating_add(project_proposal_validity_period);
    proposal.votes_for = 0; // Proposer's vote is no longer automatically counted
    proposal.votes_against = 0;
    proposal.status = ProposalStatus::Active;
    proposal.voters = vec![]; // No voters initially
    
    // Emit event
    emit_project_proposal_event(
        organization_key,
        proposal_key,
        title,
        proposer,
    );
    
    msg!("Project proposal created: {}", proposal.title);
    
    Ok(())
}

pub fn vote_on_project_proposal(
    ctx: Context<VoteOnProjectProposal>,
    vote: bool,
) -> Result<()> {
    // Get all the keys and data we need before any mutations
    let voter = ctx.accounts.voter.key();
    let org_key = ctx.accounts.organization.key();
    let organization = &ctx.accounts.organization;
    
    // Store the current immutable proposal state
    let proposal_key = ctx.accounts.proposal.key();
    let expires_at = ctx.accounts.proposal.expires_at;
    let current_status = ctx.accounts.proposal.status.clone();
    let has_voted = ctx.accounts.proposal.voters.contains(&voter);
    let proposal_title = ctx.accounts.proposal.title.clone();
    
    // Verify the voter is a valid contributor
    require!(
        is_valid_contributor(organization, voter)?,
        VotingError::InvalidContributor
    );
    
    // Check if voter has enough tokens
    require!(
        has_enough_tokens_to_vote(&ctx.accounts.voter_token_account, organization)?,
        VotingError::InsufficientTokenBalance
    );
    
    // Check if voter has already voted
    require!(!has_voted, VotingError::AlreadyVoted);
    
    // Check if proposal has expired
    require!(
        !is_proposal_expired(expires_at)?,
        VotingError::ProposalExpired
    );
    
    // Get any other data needed before mutation
    let project_proposal_threshold = organization.project_proposal_threshold_percentage;
    let contributor_count = organization.contributors.len() as u32;
    let quorum_percentage = organization.contributor_proposal_quorum_percentage;
    
    // Now we can mutate the proposal
    let proposal = &mut ctx.accounts.proposal;
    
    // Record vote
    if vote {
        proposal.votes_for += 1;
    } else {
        proposal.votes_against += 1;
    }
    
    // Add voter to the list
    proposal.voters.push(voter);
    
    // Calculate new status
    let new_status = update_proposal_status(
        proposal.votes_for,
        proposal.votes_against,
        proposal.expires_at,
        project_proposal_threshold,
        contributor_count,
        quorum_percentage
    )?;
    
    // Check if proposal became approved
    let became_approved = new_status == ProposalStatus::Approved && current_status != ProposalStatus::Approved;
    
    // Set the new status
    proposal.status = new_status;
    
    // If proposal just became approved, immediately create the project
    if became_approved {
        // Generate UUID for the project
        let project_uuid = get_uuid_from_pubkey(&proposal_key);
        
        // Calculate PDA for project and its bump
        let (project_address, project_bump) = Pubkey::find_program_address(
            &[
                b"project",
                org_key.as_ref(),
                &project_uuid[..]
            ],
            ctx.program_id
        );
        
        // Verify the project account matches the expected PDA
        require!(
            ctx.accounts.project.key() == project_address,
            VotingError::InvalidProjectAccount
        );
        
        // Create project account using seeds and bump
        let project_seeds = &[
            b"project", 
            org_key.as_ref(), 
            &project_uuid[..],
            &[project_bump]
        ];
        
        // Create the project account
        let project_space = 8 + Project::MAX_SIZE;
        let project_lamports = Rent::get()?.minimum_balance(project_space);
        let create_project_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::CreateAccount {
                from: ctx.accounts.voter.to_account_info(),
                to: ctx.accounts.project.to_account_info(),
            },
        );
        
        system_program::create_account(
            create_project_ctx.with_signer(&[project_seeds]),
            project_lamports,
            project_space as u64,
            ctx.program_id,
        )?;
        
        // Initialize the project
        let clock = Clock::get()?;
        
        // Create a new Project instance and serialize it to the account
        let project = &mut ctx.accounts.project;
        
        // Initialize the project directly
        let project_info = Project {
            organization: org_key,
            uuid: project_uuid,
            title: proposal.title.clone(),
            description: proposal.description.clone(),
            members: proposal.member_pubkeys.clone(),
            task_approval_threshold: proposal.task_approval_threshold,
            validity_end_time: clock.unix_timestamp.saturating_add(proposal.validity_period),
            is_active: true,
        };
        
        // Initialize the Project account directly
        let project_account = project.to_account_info();
        let mut data = project_account.try_borrow_mut_data()?;
        
        // Create a cursor to write to the account data
        let mut cursor = Cursor::new(&mut data[..]);
        
        // Write the anchor discriminator (8 bytes)
        let discriminator = anchor_lang::solana_program::hash::hash(b"account:Project").to_bytes()[..8].to_vec();
        cursor.write_all(&discriminator)?;
        
        // Serialize the project info
        project_info.serialize(&mut cursor)?;
        
        // Emit event for project creation
        emit!(ProjectCreatedEvent {
            organization: org_key,
            proposal: proposal_key,
            project: project_address,
            title: project_info.title.clone(),
            description: project_info.description.clone(),
            creator: voter,
            timestamp: clock.unix_timestamp,
        });
        
        msg!("Project automatically created from approved proposal: {}", proposal_title);
    } else if proposal.status == ProposalStatus::Approved {
        msg!("Project proposal already approved: {}", proposal.title);
    }
    
    // Emit vote event
    emit_vote_event(
        voter,
        proposal_key,
        vote,
    );
    
    msg!("Vote recorded. Current votes: For={}, Against={}", 
        proposal.votes_for, 
        proposal.votes_against
    );
    
    Ok(())
}

pub fn create_project(
    ctx: Context<CreateProject>,
    project_uuid: [u8; 16]
) -> Result<()> {
    // First, collect all the keys and data we need
    let creator = ctx.accounts.creator.key();
    let organization_key = ctx.accounts.organization.key();
    let organization = &ctx.accounts.organization;
    let proposal_info = ctx.accounts.proposal.to_account_info();
    let proposal_key = proposal_info.key();
    let proposal = &ctx.accounts.proposal;
    let project = &mut ctx.accounts.project;
    
    // Verify the creator is part of the organization
    require!(
        is_valid_contributor(organization, creator)?,
        VotingError::InvalidContributor
    );
    
    // Check if the project already exists (it should, as it's now created automatically when a proposal passes)
    if project.is_active {
        msg!("Project already exists: {}", project.title);
        msg!("This endpoint is maintained for backward compatibility, but projects are now created automatically when proposals are approved");
        return Ok(());
    }
    
    // Fall back to legacy behavior if the project doesn't exist yet
    // This should only happen when using old clients
    let clock = Clock::get()?;
    
    project.organization = organization_key;
    project.uuid = project_uuid;
    project.title = proposal.title.clone();
    project.description = proposal.description.clone();
    project.members = proposal.member_pubkeys.clone();
    project.task_approval_threshold = proposal.task_approval_threshold;
    project.validity_end_time = clock.unix_timestamp.saturating_add(proposal.validity_period);
    project.is_active = true;
    
    // Emit event
    emit_project_created_event(
        organization_key,
        proposal_key,
        project.key(), 
        project.title.clone(),
        project.description.clone(),
        creator,
    );
    
    msg!("Project created from approved proposal: {}", project.title);
    msg!("Note: Projects are now created automatically when proposals are approved");
    
    Ok(())
}
