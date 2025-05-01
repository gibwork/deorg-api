import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskOrderMigration1727621578138 implements MigrationInterface {
  name = 'AddTaskOrderMigration1727621578138';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "order" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "order"`);
  }
}
