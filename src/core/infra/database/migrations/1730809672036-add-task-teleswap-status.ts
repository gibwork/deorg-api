import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskTeleswapStatusMigration1730809672036
  implements MigrationInterface
{
  name = 'RenameMigration1730809672036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "teleswap_status" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "teleswap_id" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "teleswap_id"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "teleswap_status"`
    );
  }
}
