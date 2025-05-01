import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequirementsTagsServiceMigration1726499051717
  implements MigrationInterface
{
  name = 'AddRequirementsTagsServiceMigration1726499051717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "requirements" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "tags" text array NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "requirements"`
    );
  }
}
