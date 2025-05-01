import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrimaryWalletMigration1729339871860
  implements MigrationInterface
{
  name = 'AddPrimaryWalletMigration1729339871860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "primary_wallet" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_aeee7d2f4d2407baccc8b130393" UNIQUE ("primary_wallet")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_aeee7d2f4d2407baccc8b130393"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "primary_wallet"`);
  }
}
