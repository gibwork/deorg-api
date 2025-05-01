import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceAssetMigration1726445776881
  implements MigrationInterface
{
  name = 'AddServiceAssetMigration1726445776881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "asset_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_708fa71d1115f5c7d0e33b6b054" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_708fa71d1115f5c7d0e33b6b054"`
    );
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "asset_id"`);
  }
}
