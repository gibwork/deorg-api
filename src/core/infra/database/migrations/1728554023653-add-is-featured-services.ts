import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFeaturedServicesMigration1728554023653
  implements MigrationInterface
{
  name = 'AddIsFeaturedServicesMigration1728554023653';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" ADD "is_featured" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "is_featured"`);
  }
}
