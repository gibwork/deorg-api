import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExploreEntityMigration1745010518526 implements MigrationInterface {
  name = 'ExploreEntityMigration1745010518526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "explore" ("id" SERIAL NOT NULL, "task_id" uuid, "bounty_id" uuid, CONSTRAINT "PK_731b326496414997be874e13a5a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "explore" ADD CONSTRAINT "FK_374647b20081958f5b0e59f9640" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "explore" ADD CONSTRAINT "FK_2b359c092aa8e75c297b133b906" FOREIGN KEY ("bounty_id") REFERENCES "bounties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `INSERT INTO "explore" ("task_id", "bounty_id")
      SELECT "id" as "task_id", NULL as "bounty_id" FROM "tasks"
      UNION
      SELECT NULL as "task_id", "id" as "bounty_id" FROM "bounties"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "explore" DROP CONSTRAINT "FK_2b359c092aa8e75c297b133b906"`
    );
    await queryRunner.query(
      `ALTER TABLE "explore" DROP CONSTRAINT "FK_374647b20081958f5b0e59f9640"`
    );
    await queryRunner.query(`DROP TABLE "explore"`);
  }
}
