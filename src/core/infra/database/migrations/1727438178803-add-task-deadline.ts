import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskDeadlineMigration1727438178803
  implements MigrationInterface
{
  name = 'AddTaskDeadlineMigration1727438178803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "deadline" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "deadline"`);
  }
}
