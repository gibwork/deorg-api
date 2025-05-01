<p align="center">
  <a href="v2.gib.work" target="blank"><img src="https://avatars.githubusercontent.com/u/144677066?s=200&v=4" width="200" alt="Nest Logo" /></a>
</p>

## Description

Gibwork v2 api

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
