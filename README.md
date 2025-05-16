# Deorg API

<p align="center">
  <a href="https://deorg-ui.vercel.app" target="blank"><img src="https://pbs.twimg.com/profile_images/1921044848229957632/y56N34ux_400x400.jpg" width="200" alt="Deorg Logo" /></a>
</p>

## Description

Deorg API is a backend service for managing decentralized organizations (DAOs) on the Solana blockchain. It provides a comprehensive set of features for organization governance, project management, and treasury management.

### Key Features

- **Organization Management**

  - Create and manage decentralized organizations
  - Configure governance parameters (thresholds, validity periods, quorum requirements)
  - Manage organization contributors and permissions

- **Project Management**

  - Create and manage projects within organizations
  - Task creation and assignment
  - Project member management
  - Task approval workflows

- **Governance**

  - Proposal creation and voting system
  - Token-based voting mechanism
  - Configurable voting thresholds and quorum requirements
  - Support for different proposal types (project, task, treasury transfer)

- **Treasury Management**
  - Secure treasury management
  - Token-based treasury operations
  - Transfer proposals and approvals
  - Budget management for projects and tasks

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Migrations

Migrations will run automatically on start of the application.

```bash
# generate migration
# then go to `src/core/infra/database/migrations/rename_migration.ts` and rename the class name to something more meaningful
$ yarn migration:generate

# create empty migration
# then go to `src/core/infra/database/migrations/rename_migration.ts` and rename the class name to something more meaningful
$ yarn migration:create

# run migration
$ yarn migration:run

# revert migration
$ yarn migration:revert
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
