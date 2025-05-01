import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToExploreMigration1731758629998
  implements MigrationInterface
{
  name = 'AddStatusToExploreMigration1731758629998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'explore_view', 'public']
    );
    await queryRunner.query(`DROP VIEW "explore_view"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" SET NOT NULL`
    );
    await queryRunner.query(`CREATE VIEW "explore_view" AS 
    SELECT
      'tasks' as type,
      t.id,
      t.title,
      t.slug,
      t.created_at,
      t.created_by,
      t.asset_id,
      t.deadline,
      t.tags,
      t.is_featured,
      t.is_hidden,
      t.is_open,
      t.status,
      (CAST(a.amount AS numeric) - COALESCE((
        SELECT SUM(CAST(tsa.amount AS numeric))
        FROM task_submissions ts
        LEFT JOIN assets tsa ON ts.asset_id = tsa.id
        WHERE ts.task_id = t.id
      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount,
      t.teleswap_data
    FROM tasks t
    LEFT JOIN assets a ON t.asset_id = a.id

    UNION ALL

    SELECT
      'bounties' as type,
      b.id,
      b.title,
      b.slug,
      b.created_at,
      b.created_by,
      b.asset_id,
      b.deadline,
      b.tags,
      b.is_featured,
      b.is_hidden,
      b.is_open,
      'CREATED' as status,
      (CAST(a.amount AS numeric) - COALESCE((
        SELECT SUM(CAST(tsa.amount AS numeric))
        FROM task_submissions ts
        LEFT JOIN assets tsa ON ts.asset_id = tsa.id
        WHERE ts.task_id = b.id
      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount,
      NULL AS teleswap_data
    FROM bounties b
    LEFT JOIN assets a ON b.asset_id = a.id
  `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'explore_view',
        "SELECT\n      'tasks' as type,\n      t.id,\n      t.title,\n      t.slug,\n      t.created_at,\n      t.created_by,\n      t.asset_id,\n      t.deadline,\n      t.tags,\n      t.is_featured,\n      t.is_hidden,\n      t.is_open,\n      t.status,\n      (CAST(a.amount AS numeric) - COALESCE((\n        SELECT SUM(CAST(tsa.amount AS numeric))\n        FROM task_submissions ts\n        LEFT JOIN assets tsa ON ts.asset_id = tsa.id\n        WHERE ts.task_id = t.id\n      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount,\n      t.teleswap_data\n    FROM tasks t\n    LEFT JOIN assets a ON t.asset_id = a.id\n\n    UNION ALL\n\n    SELECT\n      'bounties' as type,\n      b.id,\n      b.title,\n      b.slug,\n      b.created_at,\n      b.created_by,\n      b.asset_id,\n      b.deadline,\n      b.tags,\n      b.is_featured,\n      b.is_hidden,\n      b.is_open,\n      'CREATED' as status,\n      (CAST(a.amount AS numeric) - COALESCE((\n        SELECT SUM(CAST(tsa.amount AS numeric))\n        FROM task_submissions ts\n        LEFT JOIN assets tsa ON ts.asset_id = tsa.id\n        WHERE ts.task_id = b.id\n      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount,\n      NULL AS teleswap_data\n    FROM bounties b\n    LEFT JOIN assets a ON b.asset_id = a.id"
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'explore_view', 'public']
    );
    await queryRunner.query(`DROP VIEW "explore_view"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" DROP NOT NULL`
    );
    await queryRunner.query(`CREATE VIEW "explore_view" AS SELECT
      'tasks' as type,
      t.id,
      t.title,
      t.slug,
      t.created_at,
      t.created_by,
      t.asset_id,
      t.deadline,
      t.tags,
      t.is_featured,
      t.is_hidden,
      t.is_open,
      (CAST(a.amount AS numeric) - COALESCE((
        SELECT SUM(CAST(tsa.amount AS numeric))
        FROM task_submissions ts
        LEFT JOIN assets tsa ON ts.asset_id = tsa.id
        WHERE ts.task_id = t.id
      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount
    FROM tasks t
    LEFT JOIN assets a ON t.asset_id = a.id

    UNION ALL

    SELECT
      'bounties' as type,
      b.id,
      b.title,
      b.slug,
      b.created_at,
      b.created_by,
      b.asset_id,
      b.deadline,
      b.tags,
      b.is_featured,
      b.is_hidden,
      b.is_open,
      (CAST(a.amount AS numeric) - COALESCE((
        SELECT SUM(CAST(tsa.amount AS numeric))
        FROM task_submissions ts
        LEFT JOIN assets tsa ON ts.asset_id = tsa.id
        WHERE ts.task_id = b.id
      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount
    FROM bounties b
    LEFT JOIN assets a ON b.asset_id = a.id`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'VIEW',
        'explore_view',
        "SELECT\n      'tasks' as type,\n      t.id,\n      t.title,\n      t.slug,\n      t.created_at,\n      t.created_by,\n      t.asset_id,\n      t.deadline,\n      t.tags,\n      t.is_featured,\n      t.is_hidden,\n      t.is_open,\n      (CAST(a.amount AS numeric) - COALESCE((\n        SELECT SUM(CAST(tsa.amount AS numeric))\n        FROM task_submissions ts\n        LEFT JOIN assets tsa ON ts.asset_id = tsa.id\n        WHERE ts.task_id = t.id\n      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount\n    FROM tasks t\n    LEFT JOIN assets a ON t.asset_id = a.id\n\n    UNION ALL\n\n    SELECT\n      'bounties' as type,\n      b.id,\n      b.title,\n      b.slug,\n      b.created_at,\n      b.created_by,\n      b.asset_id,\n      b.deadline,\n      b.tags,\n      b.is_featured,\n      b.is_hidden,\n      b.is_open,\n      (CAST(a.amount AS numeric) - COALESCE((\n        SELECT SUM(CAST(tsa.amount AS numeric))\n        FROM task_submissions ts\n        LEFT JOIN assets tsa ON ts.asset_id = tsa.id\n        WHERE ts.task_id = b.id\n      ), 0)) / NULLIF(CAST(a.amount AS numeric), 0) * a.price AS remaining_amount\n    FROM bounties b\n    LEFT JOIN assets a ON b.asset_id = a.id"
      ]
    );
  }
}
