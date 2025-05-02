import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProposalsTable1746149850352 implements MigrationInterface {
  name = 'CreateProposalsTable1746149850352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "organization_id" uuid NOT NULL, "created_by" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "proposals" ADD CONSTRAINT "FK_dc33bf3a873077f778084dd95a7" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposals" DROP CONSTRAINT "FK_dc33bf3a873077f778084dd95a7"`
    );
    await queryRunner.query(`DROP TABLE "proposals"`);
  }
}
