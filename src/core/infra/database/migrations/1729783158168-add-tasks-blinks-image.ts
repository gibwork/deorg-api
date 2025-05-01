import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTasksBlinksImagesMigration1729783158168
  implements MigrationInterface
{
  name = 'AddTasksBlinksImagesMigration1729783158168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "blinks_image" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "blinks_image"`);
  }
}
