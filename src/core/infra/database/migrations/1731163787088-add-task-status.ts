import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskStatusMigration1731163787088 implements MigrationInterface {
  name = 'AddTaskStatusMigration1731163787088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "teleswap_status"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "teleswap_id"`);

    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "status" character varying`
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "teleswap_data" jsonb`);

    await queryRunner.query(`
      UPDATE "tasks"
      SET "status" = CASE
        WHEN "is_open" = true THEN 'CREATED'
        ELSE 'CLOSED'
      END
    `);

    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "teleswap_data"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "status"`);

    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "teleswap_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "teleswap_status" character varying`
    );
  }
}
