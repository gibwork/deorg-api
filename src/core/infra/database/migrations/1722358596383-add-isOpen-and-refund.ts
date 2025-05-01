import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsOpenAndRefundMigration1722358596383
  implements MigrationInterface
{
  name = 'AddIsOpenAndRefundMigration1722358596383';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_open" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_refund_approved" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "refund_transaction_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "is_refund_approved" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "refund_transaction_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "is_open" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "is_refund_approved" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "refund_transaction_id" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "refund_transaction_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "is_refund_approved"`
    );
    await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "is_open"`);
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP COLUMN "refund_transaction_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP COLUMN "is_refund_approved"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "refund_transaction_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "is_refund_approved"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_open"`);
  }
}
