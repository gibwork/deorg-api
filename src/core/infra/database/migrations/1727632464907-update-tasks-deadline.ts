import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTaskDeadlineMigration1727632464907
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update('tasks')
      .set({
        deadline: () => `
      CASE
        WHEN transaction_id IS NOT NULL THEN (
          SELECT t.created_at
          FROM transactions t
          WHERE t.id = tasks.transaction_id::uuid
          LIMIT 1
        )
        ELSE (
          SELECT MAX(ts.created_at)
          FROM task_submissions ts
          WHERE ts.task_id = tasks.id
          GROUP BY ts.task_id
        )
      END
    `
      })
      .where('deadline IS NULL and is_open = false')
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .update('tasks')
      .set({
        deadline: () => `NOW() + INTERVAL '1 week'`
      })
      .where('is_open = true')
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .update('tasks')
      .set({ deadline: null })
      .where('deadline IS NOT NULL')
      .execute();
  }
}
