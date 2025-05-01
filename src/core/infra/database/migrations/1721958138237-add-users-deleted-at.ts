import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersDeletedAtMigration1721958138237
  implements MigrationInterface
{
  name = 'AddUsersDeletedAtMigration1721958138237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
  }
}
