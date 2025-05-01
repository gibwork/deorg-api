import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetadataImageMigration1727732521004
  implements MigrationInterface
{
  name = 'AddMetadataImageMigration1727732521004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "metadata_image" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "metadata_image" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "metadata_image" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "metadata_image"`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP COLUMN "metadata_image"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "metadata_image"`);
  }
}
