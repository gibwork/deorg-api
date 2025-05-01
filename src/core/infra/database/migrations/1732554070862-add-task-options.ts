import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskOptionsMigration1732554070862
  implements MigrationInterface
{
  name = 'AddTaskOptionsMigration1732554070862Migration1732554070862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_blinks_enabled" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "allow_only_verified_submissions" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "allow_only_verified_submissions"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "is_blinks_enabled"`
    );
  }
}
