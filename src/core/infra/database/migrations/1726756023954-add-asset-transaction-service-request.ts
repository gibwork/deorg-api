import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssetTransactionServiceRequestMigration1726756023954
  implements MigrationInterface
{
  name = 'AddAssetTransactionServiceRequestMigration1726756023954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD "vault_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD "transaction_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD "asset_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD CONSTRAINT "UQ_f7f876af8310bc17e08064e820d" UNIQUE ("asset_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD CONSTRAINT "FK_f7f876af8310bc17e08064e820d" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP CONSTRAINT "FK_f7f876af8310bc17e08064e820d"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP CONSTRAINT "UQ_f7f876af8310bc17e08064e820d"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP COLUMN "asset_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP COLUMN "transaction_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP COLUMN "vault_id"`
    );
  }
}
