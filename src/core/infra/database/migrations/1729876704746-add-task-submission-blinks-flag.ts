import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskSubmissionBlinksFlagMigration1729876704746
  implements MigrationInterface
{
  name = 'AddTaskSubmissionBlinksFlagMigration1729876704746';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD "blinks" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP COLUMN "blinks"`
    );
  }
}
