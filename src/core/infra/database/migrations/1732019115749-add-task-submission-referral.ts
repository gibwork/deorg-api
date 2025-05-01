import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskSubmissionReferralMigration1732019115749
  implements MigrationInterface
{
  name = 'AddTaskSubmissionReferralMigration1732019115749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD "referral_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD CONSTRAINT "UQ_ef2560c67e0c7e382c4f62fe555" UNIQUE ("referral_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_ef2560c67e0c7e382c4f62fe555" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ALTER COLUMN "asset_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_ef2560c67e0c7e382c4f62fe555"`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP CONSTRAINT "UQ_ef2560c67e0c7e382c4f62fe555"`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions" DROP COLUMN "referral_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ALTER COLUMN "asset_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
