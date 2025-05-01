import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterContentColumnServiceRequestMigration1732059158845
  implements MigrationInterface
{
  name = 'AlterContentColumnServiceRequestMigration1732059158845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" RENAME COLUMN "content" TO "requirements"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ALTER COLUMN "requirements" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services_requests" ALTER COLUMN "requirements" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" RENAME COLUMN "requirements" TO "content"`
    );
  }
}
