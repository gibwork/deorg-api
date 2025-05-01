import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecafUserWalletMigration1728558928942
  implements MigrationInterface
{
  name = 'AddDecafUserWalletMigration1728558928942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "decaf_sol_wallet" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "decaf_sol_wallet"`
    );
  }
}
