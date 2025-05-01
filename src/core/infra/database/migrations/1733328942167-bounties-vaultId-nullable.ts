import { MigrationInterface, QueryRunner } from 'typeorm';

export class BountiesVaultIdNullableMigration1733328942167
  implements MigrationInterface
{
  name = 'BountiesVaultIdNullableMigration1733328942167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "vault_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "transaction_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "transaction_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "vault_id" SET NOT NULL`
    );
  }
}
