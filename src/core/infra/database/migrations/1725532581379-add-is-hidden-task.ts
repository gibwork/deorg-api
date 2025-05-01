import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsHiddenTaskMigration1725532581379
  implements MigrationInterface
{
  name = 'AddIsHiddenTaskMigration1725532581379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_hidden" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_hidden"`);
  }
}
