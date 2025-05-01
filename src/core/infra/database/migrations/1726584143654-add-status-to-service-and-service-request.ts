import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToServiceAndServiceRequestMigration1726584143654
  implements MigrationInterface
{
  name = 'AddStatusToServiceAndServiceRequestMigration1726584143654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD "status" character varying NOT NULL DEFAULT 'OPEN'`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "is_open" boolean NOT NULL DEFAULT true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "is_open"`);
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP COLUMN "status"`
    );
  }
}
