# Task Withdrawal Implementation Plan

## Current Flow
- Task assignee needs to enable withdrawal (`enable_task_vault_withdrawal`)
- Then assignee completes task and receives payment (`complete_task`)

## New Flow
- Task assignee completes task (`complete_task`)
- Then any project member who is NOT the assignee can enable withdrawal
- Finally, assignee can withdraw funds (`withdraw_task_funds`)
- This creates a review mechanism requiring a second person to approve payment

## Implementation Checklist

### 1. Modify EnableTaskVaultWithdrawal struct
- [x] Change validation to ensure the signer is NOT the task assignee
- [x] Add validation that the signer is a project member
- [x] Add validation to ensure the task is already marked as completed

### 2. Update enable_task_vault_withdrawal function
- [x] Modify validation to enforce the signer must be a project member who is not the assignee
- [x] Update event emissions to reflect the new reviewer role

### 3. Update CompleteTask struct & function
- [x] Remove the requirement for task_vault.is_withdrawable = true
- [x] Remove funds transfer from complete_task (moved to withdraw_task_funds)
- [x] Only mark the task as completed, no funds transfer yet

### 4. Create new withdraw_task_funds functionality
- [x] Add WithdrawTaskFunds struct for the assignee to withdraw funds
- [x] Add withdraw_task_funds function to handle the actual fund transfer
- [x] Require task is completed and withdrawal is enabled

### 5. Update Error Handling
- [x] Add specific error code for "reviewer must not be assignee"
- [x] Add specific error code for "task must be completed before enabling withdrawal"

### 6. Update Event Emissions
- [x] Update TaskVaultWithdrawalEnabledEvent to include reviewer info
- [x] Add TaskPaymentEvent for the actual payment

### 7. Update Program Entry Points
- [x] Add withdraw_task_funds to lib.rs instructions

### 8. Update Tests
- [ ] Update tests to reflect the new task withdrawal flow
- [ ] Test error cases for unauthorized reviewers
- [ ] Test error cases for incomplete tasks

## Implementation Notes

As implementation proceeds, document any deviations, challenges, or additional requirements discovered:

1. Split the payment flow into three distinct operations:
   - `complete_task`: Assignee marks task as completed (no payment yet)
   - `enable_task_vault_withdrawal`: Reviewer approves the task (enables payment)
   - `withdraw_task_funds`: Assignee can finally withdraw their payment
2. Added a new TaskPaymentEvent to track the actual payment separate from task completion
3. Renamed the signer in EnableTaskVaultWithdrawal from "assignee" to "reviewer" for clarity

## Verification Steps

- [ ] Task assignee can complete task without withdrawal being enabled
- [ ] Task assignee cannot enable withdrawal themselves
- [ ] Only project members who are not the assignee can enable withdrawal
- [ ] Withdrawal can only be enabled after task is marked as completed
- [ ] Assignee can withdraw funds only after withdrawal is enabled