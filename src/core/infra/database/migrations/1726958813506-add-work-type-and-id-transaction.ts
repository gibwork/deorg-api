import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkTypeAndIdTransactionMigration1726958813506
  implements MigrationInterface
{
  name = 'AddWorkTypeAndIdTransactionMigration1726958813506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "work_type" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "work_id" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "work_id"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "work_type"`
    );
  }
}
