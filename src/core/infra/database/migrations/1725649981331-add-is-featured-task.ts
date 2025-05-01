import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFeaturedTaskMigration1725649981331
  implements MigrationInterface
{
  name = 'AddIsFeaturedTaskMigration1725649981331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "is_featured" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "is_featured"`);
  }
}
