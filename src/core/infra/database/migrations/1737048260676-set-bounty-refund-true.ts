import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetBountyRefundTrueMigration1737048260676
  implements MigrationInterface
{
  name = 'SetBountyRefundTrueMigration1737048260676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "is_refund_approved" SET DEFAULT true`
    );
    await queryRunner.query(
      `UPDATE "bounties" SET "is_refund_approved" = true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "is_refund_approved" SET DEFAULT false`
    );
    await queryRunner.query(
      `UPDATE "bounties" SET "is_refund_approved" = false`
    );
  }
}
