import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTableMigration1726372395529
  implements MigrationInterface
{
  name = 'CreateServicesTableMigration1726372395529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services_request_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "service_request_id" uuid NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c698186d0cd4539832ee1bc641c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "services_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "service_id" uuid NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6961087379b5aa08f1ec21ee22c" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "services_request_comment" ADD CONSTRAINT "FK_de0c6d6cce3529a4b50ee618a0a" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "services_request_comment" ADD CONSTRAINT "FK_35d1ba11e618f1890a167fad267" FOREIGN KEY ("service_request_id") REFERENCES "services_requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD CONSTRAINT "FK_c4b83ecd7bc7f67b0f4003ea3ef" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" ADD CONSTRAINT "FK_f782e7371d95c7cebb63af51cbb" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_c896350eb4a5969991bccfb0759" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_c896350eb4a5969991bccfb0759"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP CONSTRAINT "FK_f782e7371d95c7cebb63af51cbb"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_requests" DROP CONSTRAINT "FK_c4b83ecd7bc7f67b0f4003ea3ef"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_request_comment" DROP CONSTRAINT "FK_35d1ba11e618f1890a167fad267"`
    );
    await queryRunner.query(
      `ALTER TABLE "services_request_comment" DROP CONSTRAINT "FK_de0c6d6cce3529a4b50ee618a0a"`
    );
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "services_requests"`);
    await queryRunner.query(`DROP TABLE "services_request_comment"`);
  }
}
