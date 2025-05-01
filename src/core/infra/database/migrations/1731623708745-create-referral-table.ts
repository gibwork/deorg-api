import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReferralTableMigration1731623708745
  implements MigrationInterface
{
  name = 'CreateReferralTableMigration1731623708745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "referrals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "asset_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_b28da05bcc38e4dc8b0066f7d2" UNIQUE ("asset_id"), CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "referral_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "UQ_5c3dbffb7c62cf3bb4e944bd1c1" UNIQUE ("referral_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "referral_asset_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_5c3dbffb7c62cf3bb4e944bd1c1" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_678bbda321a8ab2d8b2ed6362a1" FOREIGN KEY ("referral_asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_678bbda321a8ab2d8b2ed6362a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_5c3dbffb7c62cf3bb4e944bd1c1"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_b28da05bcc38e4dc8b0066f7d27"`
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "referral_asset_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "UQ_5c3dbffb7c62cf3bb4e944bd1c1"`
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "referral_id"`);
    await queryRunner.query(`DROP TABLE "referrals"`);
  }
}
