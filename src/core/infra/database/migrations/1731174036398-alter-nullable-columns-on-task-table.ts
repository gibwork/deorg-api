import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterNullableColumnsOnTaskTableMigration1731174036398
  implements MigrationInterface
{
  name = 'AlterNullableColumnsOnTaskTableMigration1731174036398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "vault_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "transaction_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "transaction_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "vault_id" SET NOT NULL`
    );
  }
}
