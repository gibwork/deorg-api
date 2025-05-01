import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundReasonMigration1722787584008
  implements MigrationInterface
{
  name = 'AddRefundReasonMigration1722787584008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "refund_reason" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "refund_reason" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD "refund_reason" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP COLUMN "refund_reason"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "refund_reason"`);
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP COLUMN "refund_reason"`
    );
  }
}
