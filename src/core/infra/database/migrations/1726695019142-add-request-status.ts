import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestStatusMigration1726695019142
  implements MigrationInterface
{
  name = 'AddRequestStatusMigration1726695019142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD "service_status" character varying NOT NULL DEFAULT 'OPEN'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP COLUMN "service_status"`
    );
  }
}
