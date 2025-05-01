import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskSubmissionsCommentsTableMigration1734388752278
  implements MigrationInterface
{
  name = 'CreateTaskSubmissionsCommentsTableMigration1734388752278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_submissions_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_submission_id" uuid NOT NULL, "content" character varying NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dad14e301afcd8d4d729eb41bc4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions_comments" ADD CONSTRAINT "FK_f7c32cf62e80aeed9446b984aaf" FOREIGN KEY ("task_submission_id") REFERENCES "task_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions_comments" ADD CONSTRAINT "FK_1409816844b98aafb665fe8235c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_submissions_comments" DROP CONSTRAINT "FK_1409816844b98aafb665fe8235c"`
    );
    await queryRunner.query(
      `ALTER TABLE "task_submissions_comments" DROP CONSTRAINT "FK_f7c32cf62e80aeed9446b984aaf"`
    );
    await queryRunner.query(`DROP TABLE "task_submissions_comments"`);
  }
}
