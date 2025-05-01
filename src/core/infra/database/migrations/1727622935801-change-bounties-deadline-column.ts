import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBountiesDeadlineColumnMigration1727622935801
  implements MigrationInterface
{
  name = 'ChangeBountiesDeadlineColumnMigration1727622935801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" RENAME COLUMN "ends_at" TO "deadline"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" RENAME COLUMN "deadline" TO "ends_at"`
    );
  }
}
