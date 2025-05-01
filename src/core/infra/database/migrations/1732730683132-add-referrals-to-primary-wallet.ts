import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferralsToPrimaryWalletMigration1732730683132
  implements MigrationInterface
{
  name = 'AddReferralsToPrimaryWalletMigration1732730683132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD "primary_wallet" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ALTER COLUMN "user_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ALTER COLUMN "user_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP COLUMN "primary_wallet"`
    );
  }
}
