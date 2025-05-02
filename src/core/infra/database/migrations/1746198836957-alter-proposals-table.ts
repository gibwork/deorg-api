import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProposalsTable1746198836957 implements MigrationInterface {
  name = 'AlterProposalsTable1746198836957';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposals" ADD "account_address" character varying NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposals" DROP COLUMN "account_address"`
    );
  }
}
