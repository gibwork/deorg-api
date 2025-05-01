import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWithdrawBlinksTransactionTypeMigration1729620072448
  implements MigrationInterface
{
  name = 'AddWithdrawBlinksTransactionTypeMigration1729620072448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."transactions_type_enum" RENAME TO "transactions_type_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('deposit', 'transfer', 'withdraw', 'withdraw-task-blinks', 'withdraw-decaf', 'refund')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "public"."transactions_type_enum" USING "type"::"text"::"public"."transactions_type_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum_old" AS ENUM('deposit', 'transfer', 'withdraw', 'withdraw-decaf', 'refund')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "public"."transactions_type_enum_old" USING "type"::"text"::"public"."transactions_type_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."transactions_type_enum_old" RENAME TO "transactions_type_enum"`
    );
  }
}
