import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskBadgesTableMigration1723132040514
  implements MigrationInterface
{
  name = 'CreateTaskBadgesTableMigration1723132040514';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_badges" ("task_id" uuid NOT NULL, "badge_id" uuid NOT NULL, CONSTRAINT "PK_d093506834cae15e09a565f99de" PRIMARY KEY ("task_id", "badge_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2f0a185e3cab800535d491119" ON "task_badges" ("task_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_141a316b4a56dcdfde8e39b55a" ON "task_badges" ("badge_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "task_badges" ADD CONSTRAINT "FK_d2f0a185e3cab800535d491119d" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "task_badges" ADD CONSTRAINT "FK_141a316b4a56dcdfde8e39b55a0" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_badges" DROP CONSTRAINT "FK_141a316b4a56dcdfde8e39b55a0"`
    );
    await queryRunner.query(
      `ALTER TABLE "task_badges" DROP CONSTRAINT "FK_d2f0a185e3cab800535d491119d"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_141a316b4a56dcdfde8e39b55a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2f0a185e3cab800535d491119"`
    );
    await queryRunner.query(`DROP TABLE "task_badges"`);
  }
}
