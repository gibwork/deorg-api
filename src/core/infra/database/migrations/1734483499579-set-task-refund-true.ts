import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetTaskRefundTrueMigration1734483499579
  implements MigrationInterface
{
  name = 'SetTaskRefundTrueMigration1734483499579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "is_refund_approved" SET DEFAULT true`
    );
    await queryRunner.query(`UPDATE "tasks" SET "is_refund_approved" = true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "is_refund_approved" SET DEFAULT false`
    );
    await queryRunner.query(`UPDATE "tasks" SET "is_refund_approved" = false`);
  }
}
