import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskOriginMigration1735136629299 implements MigrationInterface {
  name = 'AddTaskOriginMigration1735136629299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "ip" character varying`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "origin" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "user_agent" character varying`
    );

    await queryRunner.query(`UPDATE tasks SET origin = 'app.gib.work'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "user_agent"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "origin"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "ip"`);
  }
}
