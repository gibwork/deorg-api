import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionIpMigration1726425130888
  implements MigrationInterface
{
  name = 'AddTransactionIpMigration1726425130888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "ip" character varying`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "ip"`);
  }
}
