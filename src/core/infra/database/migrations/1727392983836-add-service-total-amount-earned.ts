import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceTotalAmountEarnedMigration1727392983836
  implements MigrationInterface
{
  name = 'AddServiceTotalAmountEarnedMigration1727392983836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "total_amount_earned" double precision NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP COLUMN "total_amount_earned"`
    );
  }
}
