import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionFieldsToVouches1744215102149
  implements MigrationInterface
{
  name = 'AddTransactionFieldsToVouches1744215102149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vouches" ADD "transaction_completed" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "vouches" ADD "transaction_signature" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vouches" ADD "transaction_details" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vouches" DROP COLUMN "transaction_details"`
    );
    await queryRunner.query(
      `ALTER TABLE "vouches" DROP COLUMN "transaction_signature"`
    );
    await queryRunner.query(
      `ALTER TABLE "vouches" DROP COLUMN "transaction_completed"`
    );
  }
}
