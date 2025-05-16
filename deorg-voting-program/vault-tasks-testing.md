# Vault Tasks Testing Guide

This document provides a guide for testing the Task-Treasury Vault enhancement functionality, which connects task management with treasury operations to create a seamless workflow for task payment approval and disbursement.

## 1. Testing Setup

### Local Development Environment

To test the vault-tasks functionality locally, you'll need:

1. Solana CLI tools installed
2. Anchor framework installed
3. The Deorg Voting Program repository cloned

### Automated Test Script

We've provided an automated test script that:

- Starts a local Solana validator
- Builds and deploys the program
- Runs the vault-tasks test file

To run the automated test:

```bash
# Make the script executable
chmod +x scripts/test-vault-tasks.sh

# Run the test script
./scripts/test-vault-tasks.sh
```

### Manual Testing Process

If you prefer to run the tests manually, follow these steps:

1. Start a local Solana validator:

   ```bash
   solana-test-validator --reset
   ```

2. In a new terminal, build and deploy the program:

   ```bash
   anchor build
   anchor deploy
   ```

3. Run the vault-tasks test:
   ```bash
   anchor test --skip-local-validator --skip-build tests/vault-tasks-test.ts
   ```

## 2. Test Flow

The vault-tasks test verifies the following workflow:

1. **Setup**: Creates an organization, treasury registry, and project
2. **Task Creation**: Creates a task with a linked transfer proposal
3. **Voting**: Votes on the task, which triggers automatic creation of a vault and transfer of funds
4. **Task Completion**: Completes the task and verifies fund transfer to the assignee

## 3. Integration with UI Client

To test the integration with the UI client:

1. Start the local Solana validator and deploy the program as described above
2. Configure the UI to connect to your local validator:

   - In the UI project, modify the connection endpoint to `http://localhost:8899`
   - Make sure the UI is using the correct program ID

3. Start the UI application:

   ```bash
   cd ../org-voting-ui
   npm run dev
   ```

4. Test the complete workflow in the UI:
   - Create an organization
   - Initialize a treasury and register tokens
   - Create a project
   - Create a task with treasury payment
   - Vote on the task to approve it
   - Verify the vault creation
   - Complete the task
   - Verify fund withdrawal

## 4. Key Accounts to Monitor

During testing, you can monitor these accounts to verify correct behavior:

- **Task**: Contains status and references to transfer proposal and vault
- **Transfer Proposal**: Linked to the task, contains payment details
- **Task Vault**: Created after approval, holds the funds
- **Vault Token Account**: The actual token account holding the tokens

To inspect accounts:

```bash
solana account <ACCOUNT_ADDRESS> --output json
```

## 5. Troubleshooting

Common issues and solutions:

- **Program ID Mismatch**: Ensure the program ID in Anchor.toml matches what you're using in the UI
- **Transaction Simulation Error**: Check error logs for specific constraints that failed
- **Account Already Exists**: Ensure you're using unique names for organizations, projects, and tasks
- **Insufficient Funds**: Ensure treasury has enough tokens for task payments

## 6. Advanced Testing Scenarios

Once basic functionality is working, test these edge cases:

1. Task rejection scenario
2. Transfer proposal rejection scenario
3. Multiple tasks competing for treasury funds
4. Concurrent voting by multiple users
5. Edge case: Task approved but transfer rejected
6. Edge case: Transfer approved but task rejected

## 7. Performance Considerations

When testing with many tasks and transfers, monitor:

1. Transaction throughput
2. Account space usage
3. Lamport costs for each operation
