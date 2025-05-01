import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeleswapDataMigration1733334505026
  implements MigrationInterface
{
  name = 'AddTeleswapDataMigration1733334505026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bounties" ADD "teleswap_data" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP COLUMN "teleswap_data"`
    );
  }
}
