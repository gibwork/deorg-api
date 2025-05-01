import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskTokenRestrictionMigration1733250911740
  implements MigrationInterface
{
  name = 'AddTaskTokenRestrictionMigration1733250911740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mint_address" character varying NOT NULL, "symbol" character varying NOT NULL, "image_url" character varying NOT NULL, "amount" integer NOT NULL, CONSTRAINT "PK_7ff622d56e105944469f34d391d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "token_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_2d76ce65223af0683d94c17a7ea" FOREIGN KEY ("token_id") REFERENCES "task_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_2d76ce65223af0683d94c17a7ea"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "token_id"`);
    await queryRunner.query(`DROP TABLE "task_tokens"`);
  }
}
