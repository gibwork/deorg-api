import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceOrderMigration1727265798755
  implements MigrationInterface
{
  name = 'AddServiceOrderMigration1727265798755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" ADD "order" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "order"`);
  }
}
