import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesServiceMigration1726853482831
  implements MigrationInterface
{
  name = 'AddImagesServiceMigration1726853482831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "images" text array NOT NULL DEFAULT '{}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "images"`);
  }
}
