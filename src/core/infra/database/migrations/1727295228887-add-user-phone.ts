import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPhoneMigration1727295228887 implements MigrationInterface {
  name = 'AddUserPhoneMigration1727295228887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_phone_verified" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "is_phone_verified"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
