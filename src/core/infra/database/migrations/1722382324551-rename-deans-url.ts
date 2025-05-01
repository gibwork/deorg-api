import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDeansUrlMigration1722382324551
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE assets
      SET image_url = 'https://media.gib.work/token-icons/logo_dl.png'
      WHERE image_url = 'https://app.mango.markets/icons/dean.svg'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE assets
      SET image_url = 'https://app.mango.markets/icons/dean.svg'
      WHERE image_url = 'https://media.gib.work/token-icons/logo_dl.png'
    `);
  }
}
