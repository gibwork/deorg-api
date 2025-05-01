import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBountyStatusMigration1733326173370
  implements MigrationInterface
{
  name = 'AddBountyStatusMigration1733326173370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "status" character varying`
    );

    await queryRunner.query(`
      UPDATE "bounties"
      SET "status" = CASE
        WHEN "is_open" = true THEN 'CREATED'
        ELSE 'CLOSED'
      END
    `);

    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "status" SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bounties" DROP COLUMN "status"`);
  }
}
