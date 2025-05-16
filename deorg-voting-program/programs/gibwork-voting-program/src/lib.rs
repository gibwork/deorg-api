use anchor_lang::prelude::*;

pub mod contributor;
pub mod errors;
pub mod organization;
pub mod project;
pub mod state;
pub mod task;
pub mod treasury;
pub mod utils;

// All module exports
use contributor::*;
use organization::*;
use project::*;
use task::*;
use treasury::*;

declare_id!("CLzwfsfNSQM73U7J5zURwRycdsWhFhTGaUvPYQU1TYPK");

#[program]
pub mod deorg_voting_program {
    use super::*;

    // Organization Management
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
        creator_rate: u64,
    ) -> Result<()> {
        organization::create_organization(
            ctx,
            organization_uuid,
            organization_name,
            contributor_proposal_threshold,
            contributor_proposal_validity_period,
            contributor_validity_period,
            contributor_proposal_quorum_percentage,
            project_proposal_threshold,
            project_proposal_validity_period,
            minimum_token_requirement,
            treasury_transfer_threshold_percentage,
            treasury_transfer_proposal_validity_period,
            treasury_transfer_quorum_percentage,
            creator_rate,
        )
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
        organization::update_organization_parameters(
            ctx,
            organization_name,
            contributor_proposal_threshold,
            contributor_proposal_validity_period,
            contributor_validity_period,
            contributor_proposal_quorum_percentage,
            project_proposal_threshold,
            project_proposal_validity_period,
            minimum_token_requirement,
            treasury_transfer_threshold_percentage,
            treasury_transfer_proposal_validity_period,
            treasury_transfer_quorum_percentage,
        )
    }

    // Contributor Management
    pub fn propose_contributor(ctx: Context<ProposeContributor>, proposed_rate: u64) -> Result<()> {
        contributor::propose_contributor(ctx, proposed_rate)
    }

    pub fn vote_on_contributor_proposal(
        ctx: Context<VoteOnContributorProposal>,
        vote: bool,
    ) -> Result<()> {
        contributor::vote_on_contributor_proposal(ctx, vote)
    }

    pub fn renew_contributor(ctx: Context<RenewContributor>) -> Result<()> {
        contributor::renew_contributor(ctx)
    }

    // Project Management
    pub fn propose_project(
        ctx: Context<ProposeProject>,
        title: String,
        description: String,
        member_pubkeys: Vec<Pubkey>,
        task_approval_threshold: u8,
        validity_period: i64,
    ) -> Result<()> {
        project::propose_project(
            ctx,
            title,
            description,
            member_pubkeys,
            task_approval_threshold,
            validity_period,
        )
    }

    pub fn vote_on_project_proposal(ctx: Context<VoteOnProjectProposal>, vote: bool) -> Result<()> {
        project::vote_on_project_proposal(ctx, vote)
    }

    pub fn create_project(ctx: Context<CreateProject>, project_uuid: [u8; 16]) -> Result<()> {
        project::create_project(ctx, project_uuid)
    }

    // Task Management
    pub fn propose_task(
        ctx: Context<ProposeTask>,
        title: String,
        description: String,
        payment_amount: u64,
        assignee: Pubkey,
        token_mint: Pubkey,
    ) -> Result<()> {
        task::propose_task(
            ctx,
            title,
            description,
            payment_amount,
            assignee,
            token_mint,
        )
    }

    pub fn vote_on_task_proposal(ctx: Context<VoteOnTaskProposal>, vote: bool) -> Result<()> {
        task::vote_on_task_proposal(ctx, vote)
    }

    pub fn enable_task_vault_withdrawal(ctx: Context<EnableTaskVaultWithdrawal>) -> Result<()> {
        task::enable_task_vault_withdrawal(ctx)
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        task::complete_task(ctx)
    }

    // Treasury Management
    pub fn initialize_treasury_registry(ctx: Context<InitializeTreasuryRegistry>) -> Result<()> {
        treasury::initialize_treasury_registry(ctx)
    }

    pub fn register_treasury_token(ctx: Context<RegisterTreasuryToken>) -> Result<()> {
        treasury::register_treasury_token(ctx)
    }

    pub fn propose_funds_transfer(
        ctx: Context<ProposeFundsTransfer>,
        amount: u64,
        description: String,
        token_mint: Pubkey,
        nonce: u64,
    ) -> Result<()> {
        treasury::propose_funds_transfer(ctx, amount, description, token_mint, nonce)
    }

    pub fn vote_on_funds_transfer_proposal(
        ctx: Context<VoteOnFundsTransferProposal>,
        vote: bool,
    ) -> Result<()> {
        treasury::vote_on_funds_transfer_proposal(ctx, vote)
    }

    pub fn execute_funds_transfer(ctx: Context<ExecuteFundsTransfer>) -> Result<()> {
        treasury::execute_funds_transfer(ctx)
    }

    pub fn deposit_to_treasury(ctx: Context<DepositToTreasury>, amount: u64) -> Result<()> {
        treasury::deposit_to_treasury(ctx, amount)
    }

    // Organization Metadata Management
    pub fn initialize_organization_metadata(
        ctx: Context<InitializeOrganizationMetadata>,
        logo_url: Option<String>,
        website_url: Option<String>,
        twitter_url: Option<String>,
        discord_url: Option<String>,
        telegram_url: Option<String>,
        description: Option<String>,
    ) -> Result<()> {
        organization::initialize_organization_metadata(
            ctx,
            logo_url,
            website_url,
            twitter_url,
            discord_url,
            telegram_url,
            description,
        )
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
        organization::update_organization_metadata(
            ctx,
            logo_url,
            website_url,
            twitter_url,
            discord_url,
            telegram_url,
            description,
        )
    }
}
