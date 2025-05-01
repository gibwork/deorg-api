import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserXAccountMigration1728131534936
  implements MigrationInterface
{
  name = 'AddUserXAccountMigration1728131534936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "x_account" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "x_account_verified" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "x_account_verified"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "x_account"`);
  }
}
