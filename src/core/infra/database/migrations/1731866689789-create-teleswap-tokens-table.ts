import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeleswapTokensTableMigration1731866689789
  implements MigrationInterface
{
  name = 'CreateTeleswapTokensTableMigration1731866689789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "teleswap_tokens" ("id" character varying NOT NULL, "name" character varying, "symbol" character varying, "img" character varying, "network" character varying, "address" character varying, "is_fiat" boolean, "is_active" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_39ea22a204a101298d9a99a37f3" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "teleswap_tokens"`);
  }
}
