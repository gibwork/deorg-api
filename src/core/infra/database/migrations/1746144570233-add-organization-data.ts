import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationData1746144570233 implements MigrationInterface {
  name = 'AddOrganizationData1746144570233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "slug" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "external_id" character varying NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN "external_id"`
    );
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN "slug"`);
  }
}
