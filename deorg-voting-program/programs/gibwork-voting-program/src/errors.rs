use anchor_lang::prelude::*;

#[error_code]
pub enum VotingError {
    #[msg("The provided threshold is not within valid range (0-100)")]
    InvalidThreshold,
    
    #[msg("The provided validity period must be greater than zero")]
    InvalidValidityPeriod,
    
    #[msg("Only the organization creator can update parameters")]
    UnauthorizedOrganizationUpdate,
    
    #[msg("Only active contributors can perform this action")]
    InvalidContributor,
    
    #[msg("This account is already a contributor")]
    AlreadyContributor,
    
    #[msg("Proposal has expired")]
    ProposalExpired,
    
    #[msg("This account has already voted on this proposal")]
    AlreadyVoted,
    
    #[msg("Voter does not have enough tokens to vote")]
    InsufficientTokenBalance,
    
    #[msg("Only project members can vote on or create tasks")]
    UnauthorizedProjectAction,
    
    #[msg("This action is not allowed in the current state")]
    InvalidStateForAction,
    
    #[msg("Task has not received enough votes to be completed")]
    InsufficientTaskVotes,
    
    #[msg("The project validity period has expired")]
    ProjectExpired,
    
    #[msg("Invalid budget amount specified")]
    InvalidBudgetAmount,
    
    #[msg("Proposal status is not active")]
    ProposalNotActive,
    
    #[msg("Task status is not in the right state for this action")]
    InvalidTaskStatus,

    #[msg("The provided contributor account does not match the expected PDA")]
    InvalidContributorAccount,
    
    #[msg("Invalid quorum requirement, must be between 1-100%")]
    InvalidQuorumRequirement,
    
    #[msg("Invalid organization name")]
    InvalidOrganizationName,
    
    #[msg("Proposal must be approved to create a project")]
    ProposalNotApproved,
    
    #[msg("Failed to create project from proposal")]
    ProjectCreationFailed,
    
    #[msg("Insufficient account balance for this operation")]
    InsufficientBalance,

    #[msg("Token account does not belong to the voter")]
    InvalidTokenAccount,
    
    #[msg("Token account mint does not match organization's token mint")]
    InvalidTokenMint,
    
    #[msg("The provided project account does not match the expected PDA")]
    InvalidProjectAccount,

    // New treasury-related errors
    #[msg("Insufficient funds in treasury for this transfer")]
    InsufficientTreasuryBalance,
    
    #[msg("Treasury not initialized for this organization")]
    TreasuryNotInitialized,
    
    #[msg("This proposal has already been executed")]
    ProposalAlreadyExecuted,
    
    #[msg("Invalid transfer amount")]
    InvalidTransferAmount,
    
    #[msg("Token not registered with treasury")]
    TokenNotRegistered,
    
    #[msg("Registry already exists for this organization")]
    RegistryAlreadyExists,
    
    #[msg("Maximum number of treasury tokens reached")]
    MaximumTokensReached,
    
    // Task vault related errors
    #[msg("Task vault already exists for this task")]
    TaskVaultAlreadyExists,
    
    #[msg("Task not ready for vault creation")]
    TaskNotReadyForVault,
    
    #[msg("Transfer proposal not linked to task")]
    TransferProposalNotLinked,
    
    #[msg("Task vault not found")]
    TaskVaultNotFound,
    
    #[msg("Unauthorized withdrawal attempt")]
    UnauthorizedWithdrawal,
    
    #[msg("Withdrawal not enabled for this task vault")]
    WithdrawalNotEnabled,
    
    #[msg("Withdrawal already enabled for this task vault")]
    WithdrawalAlreadyEnabled,
    
    #[msg("Reviewer must not be the task assignee")]
    ReviewerCannotBeAssignee,
    
    #[msg("Task must be completed before enabling withdrawal")]
    TaskNotCompleted,
    
    // Task Proposal related errors
    #[msg("The provided task account does not match the expected PDA")]
    InvalidTaskAccount,
    
    #[msg("Task proposal not found")]
    TaskProposalNotFound,
    
    #[msg("Task proposal must be in active status")]
    TaskProposalNotActive,
    
    #[msg("Task proposal must be approved to create a task")]
    TaskProposalNotApproved,

    // Metadata related errors
    #[msg("Invalid metadata URL provided (too long)")]
    InvalidMetadataUrl,
    
    #[msg("Invalid metadata account")]
    InvalidMetadataAccount,
    
    #[msg("Invalid metadata description (too long)")]
    InvalidMetadataDescription,
}
