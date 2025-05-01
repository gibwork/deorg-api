import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceIsHiddenMigration1727486808210
  implements MigrationInterface
{
  name = 'AddServiceIsHiddenMigration1727486808210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "is_hidden" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "is_hidden"`);
  }
}
