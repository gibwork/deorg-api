use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use crate::state::*;
use crate::errors::VotingError;
use crate::utils::*;

#[derive(Accounts)]
#[instruction(proposed_rate: u64, timestamp: i64)]
pub struct ProposeContributor<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    
    #[account(mut)]
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = proposer,
        space = 8 + ContributorProposal::MAX_SIZE,
        seeds = [
            b"contributor_proposal", 
            organization.key().as_ref(), 
            candidate.key.as_ref(),
            &timestamp.to_le_bytes()
        ],
        bump
    )]
    pub proposal: Account<'info, ContributorProposal>,
    
    /// CHECK: This is the candidate being proposed as a contributor
    pub candidate: AccountInfo<'info>,
    
    #[account(
        init_if_needed,
        payer = proposer,
        space = 8 + Contributor::MAX_SIZE,
        seeds = [
            b"contributor",
            organization.key().as_ref(),
            candidate.key.as_ref()
        ],
        bump
    )]
    pub contributor: Account<'info, Contributor>,
    
    #[account(
        constraint = proposer_token_account.owner == proposer.key() @ VotingError::InvalidTokenAccount,
        constraint = proposer_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub proposer_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnContributorProposal<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    
    #[account(mut)]
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        constraint = proposal.organization == organization.key(),
        constraint = proposal.status == ProposalStatus::Active @ VotingError::ProposalNotActive
    )]
    pub proposal: Account<'info, ContributorProposal>,
    
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + Contributor::MAX_SIZE,
        seeds = [
            b"contributor",
            organization.key().as_ref(),
            proposal.candidate.as_ref()
        ],
        bump
    )]
    pub contributor: Account<'info, Contributor>,
    
    #[account(
        constraint = voter_token_account.owner == voter.key() @ VotingError::InvalidTokenAccount,
        constraint = voter_token_account.mint == organization.token_mint @ VotingError::InvalidTokenMint
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RenewContributor<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        seeds = [
            b"contributor",
            organization.key().as_ref(),
            authority.key().as_ref()
        ],
        bump,
        constraint = contributor.authority == authority.key()
    )]
    pub contributor: Account<'info, Contributor>,
}

// Instruction implementation
pub fn propose_contributor(
    ctx: Context<ProposeContributor>,
    proposed_rate: u64,
    timestamp: i64,
) -> Result<()> {
    // Get key account identities and all required values first
    let proposer = ctx.accounts.proposer.key();
    let candidate = ctx.accounts.candidate.key();
    let organization_key = ctx.accounts.organization.key();
    let contributor_proposal_validity_period = ctx.accounts.organization.contributor_proposal_validity_period;
    let contributor_proposal_threshold = ctx.accounts.organization.contributor_proposal_threshold_percentage;
    let contributor_validity_period = ctx.accounts.organization.contributor_validity_period;
    
    // Check validations
    {
        // Check if proposer is a valid contributor
        let is_proposer_contributor = is_valid_contributor(&ctx.accounts.organization, proposer)?;
        require!(
            is_proposer_contributor,
            VotingError::InvalidContributor
        );
        
        // Check if proposer has enough tokens - Using the updated function with Account<TokenAccount>
        let has_enough_tokens = has_enough_tokens_to_vote(&ctx.accounts.proposer_token_account, &ctx.accounts.organization)?;
        require!(
            has_enough_tokens,
            VotingError::InsufficientTokenBalance
        );
        
        // Check if candidate is already a contributor
        let is_already_contributor = ctx.accounts.organization.contributors.contains(&candidate);
        require!(
            !is_already_contributor,
            VotingError::AlreadyContributor
        );
    }
    
    // Validate timestamp is recent (prevent replay attacks)
    let clock = Clock::get()?;
    require!(
        (clock.unix_timestamp - timestamp).abs() < 300, // Within 5 minutes
        VotingError::InvalidTimestamp
    );
    
    // Initialize the proposal
    let proposal = &mut ctx.accounts.proposal;
    
    proposal.organization = organization_key;
    proposal.candidate = candidate;
    proposal.proposer = proposer;
    proposal.proposed_rate = proposed_rate;
    proposal.created_at = timestamp;
    proposal.expires_at = clock.unix_timestamp.saturating_add(contributor_proposal_validity_period);
    proposal.votes_for = 0; // Proposer's vote is no longer automatically counted
    proposal.votes_against = 0;
    proposal.status = ProposalStatus::Active; // Make sure to set the initial status
    proposal.voters = vec![]; // No voters initially
    
    // Since the proposer's vote is no longer automatically counted,
    // we just set the status to Active - it can't be immediately approved
    proposal.status = ProposalStatus::Active;
    
    // Emit event
    emit_contributor_proposal_event(
        organization_key,
        proposal.key(),
        candidate,
        proposer,
    );
    
    msg!("Contributor proposal created for candidate: {}", candidate);
    
    Ok(())
}

pub fn vote_on_contributor_proposal(
    ctx: Context<VoteOnContributorProposal>,
    vote: bool,
) -> Result<()> {
    // Get all key account identities and required values first
    let voter = ctx.accounts.voter.key();
    let organization_key = ctx.accounts.organization.key();
    let contributor_proposal_threshold = ctx.accounts.organization.contributor_proposal_threshold_percentage;
    let contributor_validity_period = ctx.accounts.organization.contributor_validity_period;
    let proposal = &mut ctx.accounts.proposal;
    let candidate = proposal.candidate;
    
    // Check validations
    {
        // Check if voter is a valid contributor
        let is_voter_contributor = is_valid_contributor(&ctx.accounts.organization, voter)?;
        require!(
            is_voter_contributor,
            VotingError::InvalidContributor
        );
        
        // Check if voter has enough tokens
        let has_enough_tokens = has_enough_tokens_to_vote(&ctx.accounts.voter_token_account, &ctx.accounts.organization)?;
        require!(
            has_enough_tokens,
            VotingError::InsufficientTokenBalance
        );
        
        // Check if voter has already voted
        let has_already_voted = proposal.voters.contains(&voter);
        require!(
            !has_already_voted,
            VotingError::AlreadyVoted
        );
        
        // Check if proposal has expired
        let is_expired = is_proposal_expired(proposal.expires_at)?;
        require!(
            !is_expired,
            VotingError::ProposalExpired
        );
    }
    
    // Record vote
    if vote {
        proposal.votes_for += 1;
    } else {
        proposal.votes_against += 1;
    }
    
    // Add voter to the list
    proposal.voters.push(voter);
    
    // Update proposal status
    proposal.status = update_proposal_status(
        proposal.votes_for,
        proposal.votes_against,
        proposal.expires_at,
        contributor_proposal_threshold,
        ctx.accounts.organization.contributors.len() as u32, // Total contributors
        ctx.accounts.organization.contributor_proposal_quorum_percentage, // Quorum percentage
    )?;
    
    // Check if the candidate is already in the contributors list
    let is_already_contributor = ctx.accounts.organization.contributors.contains(&candidate);
    
    // If proposal is approved and the candidate is not already a contributor
    if proposal.status == ProposalStatus::Approved && !is_already_contributor {
        // Add candidate to contributors list
        let mut contributors = ctx.accounts.organization.contributors.clone();
        contributors.push(candidate);
        ctx.accounts.organization.contributors = contributors;
        
        // Initialize the contributor account
        let contributor = &mut ctx.accounts.contributor;
        let clock = Clock::get()?;
        
        contributor.organization = organization_key;
        contributor.authority = candidate;
        contributor.rate = proposal.proposed_rate;
        contributor.validity_end_time = clock.unix_timestamp.saturating_add(contributor_validity_period);
        contributor.is_active = true;
        
        msg!("Proposal approved! New contributor added and account created for: {}", candidate);
    }
    
    // Emit vote event
    emit_vote_event(
        voter,
        proposal.key(),
        vote,
    );
    
    msg!("Vote recorded. Current votes: For={}, Against={}", 
        proposal.votes_for, 
        proposal.votes_against
    );
    
    Ok(())
}

pub fn renew_contributor(ctx: Context<RenewContributor>) -> Result<()> {
    let organization = &ctx.accounts.organization;
    let contributor = &mut ctx.accounts.contributor;
    
    // Check if contributor is in the organization's list
    require!(
        organization.contributors.contains(&contributor.authority),
        VotingError::InvalidContributor
    );
    
    // Update the validity period
    let clock = Clock::get()?;
    contributor.validity_end_time = clock.unix_timestamp.saturating_add(
        organization.contributor_validity_period
    );
    contributor.is_active = true;
    
    msg!("Contributor status renewed until {}", contributor.validity_end_time);
    
    Ok(())
}
