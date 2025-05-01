import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressOrderToNftsMigration1733368909230
  implements MigrationInterface
{
  name = 'AddAddressOrderToNftsMigration1733368909230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_collections" ADD "order" integer`
    );
    await queryRunner.query(
      `ALTER TABLE "nft_collections" ADD "address" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nft_collections" DROP COLUMN "address"`
    );
    await queryRunner.query(
      `ALTER TABLE "nft_collections" DROP COLUMN "order"`
    );
  }
}
