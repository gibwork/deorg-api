import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrganizationNameMigration1746389859745
  implements MigrationInterface
{
  name = 'RemoveOrganizationNameMigration1746389859745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "UQ_826b823731c7728206b6f8c78ca" UNIQUE ("account_address")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP CONSTRAINT "UQ_826b823731c7728206b6f8c78ca"`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "name" character varying NOT NULL`
    );
  }
}
