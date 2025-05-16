use anchor_lang::prelude::*;
use anchor_spl::token::ID as TokenProgramID;
use crate::state::*;
use crate::errors::VotingError;
use crate::utils::*;

#[derive(Accounts)]
#[instruction(
    organization_uuid: [u8; 16],
    organization_name: String,
    contributor_proposal_threshold: u8,
    contributor_proposal_validity_period: i64,
    contributor_validity_period: i64,
    contributor_proposal_quorum_percentage: u8,
    project_proposal_threshold: u8,
    project_proposal_validity_period: i64,
    minimum_token_requirement: u64,
    treasury_transfer_threshold_percentage: u8,
    treasury_transfer_proposal_validity_period: i64,
    treasury_transfer_quorum_percentage: u8,
    creator_rate: u64
)]
pub struct CreateOrganization<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Organization::MAX_SIZE,
        seeds = [b"organization", creator.key().as_ref(), organization_uuid.as_ref()],
        bump
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Contributor::MAX_SIZE,
        seeds = [
            b"contributor",
            organization.key().as_ref(),
            creator.key().as_ref()
        ],
        bump
    )]
    pub creator_contributor: Account<'info, Contributor>,
    
    /// CHECK: Token mint account
    #[account(
        owner = anchor_spl::token::ID
    )]
    pub token_mint: AccountInfo<'info>,
    
    /// CHECK: Token account verification
    #[account(
        owner = anchor_spl::token::ID
    )]
    pub creator_token_account: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOrganizationParameters<'info> {
    #[account(
        mut,
        constraint = organization.creator == creator.key() @ VotingError::UnauthorizedOrganizationUpdate
    )]
    pub organization: Account<'info, Organization>,
    
    pub creator: Signer<'info>,
}

pub fn create_organization(
    ctx: Context<CreateOrganization>,
    organization_uuid: [u8; 16],
    organization_name: String,
    contributor_proposal_threshold: u8,
    contributor_proposal_validity_period: i64,
    contributor_validity_period: i64,
    contributor_proposal_quorum_percentage: u8,
    project_proposal_threshold: u8,
    project_proposal_validity_period: i64,
    minimum_token_requirement: u64,
    treasury_transfer_threshold_percentage: u8,
    treasury_transfer_proposal_validity_period: i64,
    treasury_transfer_quorum_percentage: u8,
    creator_rate: u64, // Optional in older client versions
) -> Result<()> {
    // Validate inputs
    validate_threshold(contributor_proposal_threshold)?;
    validate_threshold(project_proposal_threshold)?;
    validate_threshold(contributor_proposal_quorum_percentage)?; // Validate quorum percentage
    validate_validity_period(contributor_proposal_validity_period)?;
    validate_validity_period(contributor_validity_period)?;
    validate_validity_period(project_proposal_validity_period)?;
    
    // Validate new treasury parameters
    validate_threshold(treasury_transfer_threshold_percentage)?;
    validate_threshold(treasury_transfer_quorum_percentage)?;
    validate_validity_period(treasury_transfer_proposal_validity_period)?;
    
    // Make sure quorum percentage is reasonable (at least requiring 1 person to vote)
    require!(
        contributor_proposal_quorum_percentage > 0,
        VotingError::InvalidQuorumRequirement
    );
    
    require!(
        treasury_transfer_quorum_percentage > 0,
        VotingError::InvalidQuorumRequirement
    );
    
    // Validate organization name
    require!(
        !organization_name.is_empty() && organization_name.len() <= 120,
        VotingError::InvalidOrganizationName
    );
    
    // Initialize organization
    let organization = &mut ctx.accounts.organization;
    let creator = ctx.accounts.creator.key();
    
    organization.creator = creator;
    organization.uuid = organization_uuid;
    organization.name = organization_name;
    organization.contributors = vec![creator]; // Creator is automatically the first contributor
    organization.contributor_proposal_threshold_percentage = contributor_proposal_threshold;
    organization.contributor_proposal_validity_period = contributor_proposal_validity_period;
    organization.contributor_validity_period = contributor_validity_period;
    organization.contributor_proposal_quorum_percentage = contributor_proposal_quorum_percentage;
    organization.project_proposal_threshold_percentage = project_proposal_threshold;
    organization.project_proposal_validity_period = project_proposal_validity_period;
    organization.token_mint = ctx.accounts.token_mint.key();
    organization.minimum_token_requirement = minimum_token_requirement;
    
    // Set treasury fields
    organization.treasury_transfer_threshold_percentage = treasury_transfer_threshold_percentage;
    organization.treasury_transfer_proposal_validity_period = treasury_transfer_proposal_validity_period;
    organization.treasury_transfer_quorum_percentage = treasury_transfer_quorum_percentage;
    
    // Initialize the contributor account for the creator
    let contributor = &mut ctx.accounts.creator_contributor;
    let clock = Clock::get()?;
    
    contributor.organization = organization.key();
    contributor.authority = creator;
    contributor.rate = creator_rate;
    contributor.validity_end_time = clock.unix_timestamp.saturating_add(contributor_validity_period);
    contributor.is_active = true;
    
    msg!("Organization created with ID: {}", organization.key());
    msg!("Creator contributor account created with rate: {}", creator_rate);
    
    Ok(())
}

pub fn update_organization_parameters(
    ctx: Context<UpdateOrganizationParameters>,
    organization_name: String,
    contributor_proposal_threshold: u8,
    contributor_proposal_validity_period: i64,
    contributor_validity_period: i64,
    contributor_proposal_quorum_percentage: u8,
    project_proposal_threshold: u8,
    project_proposal_validity_period: i64,
    minimum_token_requirement: u64,
    treasury_transfer_threshold_percentage: u8,
    treasury_transfer_proposal_validity_period: i64,
    treasury_transfer_quorum_percentage: u8,
) -> Result<()> {
    // Validate inputs
    validate_threshold(contributor_proposal_threshold)?;
    validate_threshold(project_proposal_threshold)?;
    validate_threshold(contributor_proposal_quorum_percentage)?;
    validate_validity_period(contributor_proposal_validity_period)?;
    validate_validity_period(contributor_validity_period)?;
    validate_validity_period(project_proposal_validity_period)?;
    
    // Validate new treasury parameters
    validate_threshold(treasury_transfer_threshold_percentage)?;
    validate_threshold(treasury_transfer_quorum_percentage)?;
    validate_validity_period(treasury_transfer_proposal_validity_period)?;
    
    // Make sure quorum percentage is reasonable
    require!(
        contributor_proposal_quorum_percentage > 0,
        VotingError::InvalidQuorumRequirement
    );
    
    require!(
        treasury_transfer_quorum_percentage > 0,
        VotingError::InvalidQuorumRequirement
    );
    
    // Validate organization name
    require!(
        !organization_name.is_empty() && organization_name.len() <= 120,
        VotingError::InvalidOrganizationName
    );
    
    // Update organization parameters
    let organization = &mut ctx.accounts.organization;
    
    organization.name = organization_name; // Update the name
    organization.contributor_proposal_threshold_percentage = contributor_proposal_threshold;
    organization.contributor_proposal_validity_period = contributor_proposal_validity_period;
    organization.contributor_validity_period = contributor_validity_period;
    organization.contributor_proposal_quorum_percentage = contributor_proposal_quorum_percentage;
    organization.project_proposal_threshold_percentage = project_proposal_threshold;
    organization.project_proposal_validity_period = project_proposal_validity_period;
    organization.minimum_token_requirement = minimum_token_requirement;
    
    // Update treasury fields
    organization.treasury_transfer_threshold_percentage = treasury_transfer_threshold_percentage;
    organization.treasury_transfer_proposal_validity_period = treasury_transfer_proposal_validity_period;
    organization.treasury_transfer_quorum_percentage = treasury_transfer_quorum_percentage;
    
    msg!("Organization parameters updated");
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeOrganizationMetadata<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        constraint = organization.creator == creator.key() @ VotingError::UnauthorizedOrganizationUpdate
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + OrganizationMetadata::MAX_SIZE,
        seeds = [b"metadata", organization.key().as_ref()],
        bump
    )]
    pub metadata: Account<'info, OrganizationMetadata>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOrganizationMetadata<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        constraint = organization.creator == creator.key() @ VotingError::UnauthorizedOrganizationUpdate
    )]
    pub organization: Account<'info, Organization>,
    
    #[account(
        mut,
        seeds = [b"metadata", organization.key().as_ref()],
        bump,
        constraint = metadata.organization == organization.key() @ VotingError::InvalidMetadataAccount
    )]
    pub metadata: Account<'info, OrganizationMetadata>,
}

pub fn initialize_organization_metadata(
    ctx: Context<InitializeOrganizationMetadata>,
    logo_url: Option<String>,
    website_url: Option<String>,
    twitter_url: Option<String>,
    discord_url: Option<String>,
    telegram_url: Option<String>,
    description: Option<String>,
) -> Result<()> {
    // Validate URL lengths if provided
    if let Some(url) = &logo_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &website_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &twitter_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &discord_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &telegram_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    // Validate description length if provided
    if let Some(desc) = &description {
        require!(
            desc.len() <= OrganizationMetadata::MAX_DESCRIPTION_LENGTH,
            VotingError::InvalidMetadataDescription
        );
    }
    
    // Initialize metadata account
    let metadata = &mut ctx.accounts.metadata;
    let organization = &ctx.accounts.organization;
    
    metadata.organization = organization.key();
    metadata.logo_url = logo_url;
    metadata.website_url = website_url;
    metadata.twitter_url = twitter_url;
    metadata.discord_url = discord_url;
    metadata.telegram_url = telegram_url;
    metadata.description = description;
    
    msg!("Organization metadata initialized");
    
    Ok(())
}

pub fn update_organization_metadata(
    ctx: Context<UpdateOrganizationMetadata>,
    logo_url: Option<String>,
    website_url: Option<String>,
    twitter_url: Option<String>,
    discord_url: Option<String>,
    telegram_url: Option<String>,
    description: Option<String>,
) -> Result<()> {
    // Validate URL lengths if provided
    if let Some(url) = &logo_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &website_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &twitter_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &discord_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    if let Some(url) = &telegram_url {
        require!(
            url.len() <= OrganizationMetadata::MAX_URL_LENGTH,
            VotingError::InvalidMetadataUrl
        );
    }
    
    // Validate description length if provided
    if let Some(desc) = &description {
        require!(
            desc.len() <= OrganizationMetadata::MAX_DESCRIPTION_LENGTH,
            VotingError::InvalidMetadataDescription
        );
    }
    
    // Update metadata
    let metadata = &mut ctx.accounts.metadata;
    
    metadata.logo_url = logo_url;
    metadata.website_url = website_url;
    metadata.twitter_url = twitter_url;
    metadata.discord_url = discord_url;
    metadata.telegram_url = telegram_url;
    metadata.description = description;
    
    msg!("Organization metadata updated");
    
    Ok(())
}
