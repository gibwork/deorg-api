import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokensTableMigration1730252477615
  implements MigrationInterface
{
  name = 'CreateTokensTableMigration1730252477615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tokens" ("address" character varying NOT NULL, "decimals" integer NOT NULL, "logo_uri" character varying, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "tags" text array NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8887c0fb937bc0e9dc36cb62f35" PRIMARY KEY ("address"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tokens"`);
  }
}
