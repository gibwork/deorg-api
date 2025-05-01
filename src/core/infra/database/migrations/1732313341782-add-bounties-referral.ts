import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBountiesReferralMigration1732313341782
  implements MigrationInterface
{
  name = 'AddBountiesReferralMigration1732313341782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" ADD "referral_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" ADD CONSTRAINT "UQ_19a06e1ec7ddeaafca1cfb0f4d3" UNIQUE ("referral_id")`
    );
    await queryRunner.query(`ALTER TABLE "bounties" ADD "referral_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD CONSTRAINT "UQ_cccf1f10e8f1375e0cdfe880f68" UNIQUE ("referral_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" ADD CONSTRAINT "FK_19a06e1ec7ddeaafca1cfb0f4d3" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD CONSTRAINT "FK_cccf1f10e8f1375e0cdfe880f68" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP CONSTRAINT "FK_cccf1f10e8f1375e0cdfe880f68"`
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" DROP CONSTRAINT "FK_19a06e1ec7ddeaafca1cfb0f4d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP CONSTRAINT "UQ_cccf1f10e8f1375e0cdfe880f68"`
    );
    await queryRunner.query(`ALTER TABLE "bounties" DROP COLUMN "referral_id"`);
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" DROP CONSTRAINT "UQ_19a06e1ec7ddeaafca1cfb0f4d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "bounty_submissions" DROP COLUMN "referral_id"`
    );
  }
}
