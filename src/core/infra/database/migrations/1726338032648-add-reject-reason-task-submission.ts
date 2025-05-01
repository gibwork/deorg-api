import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectReasonTaskSubmissionMigration1726338032648
  implements MigrationInterface
{
  name = 'AddRejectReasonTaskSubmissionMigration1726338032648';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD "reject_reason" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP COLUMN "reject_reason"`
    );
  }
}
