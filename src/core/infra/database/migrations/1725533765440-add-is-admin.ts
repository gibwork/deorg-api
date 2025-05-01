import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAdminMigration1725533765440 implements MigrationInterface {
  name = 'AddIsAdminMigration1725533765440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_admin" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_admin"`);
  }
}
