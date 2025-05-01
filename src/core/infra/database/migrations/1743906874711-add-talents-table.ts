import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTalentsTable1743906874711 implements MigrationInterface {
  name = 'AddTalentsTable1743906874711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "talents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "description" character varying, "skills" text array NOT NULL, "asset_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_00e580ce176f1118857d1e8a96" UNIQUE ("user_id"), CONSTRAINT "REL_688ecf20152dd2fe828f60a560" UNIQUE ("asset_id"), CONSTRAINT "PK_8cecf07c0d624cc503d6a36df52" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD CONSTRAINT "FK_00e580ce176f1118857d1e8a964" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "talents" ADD CONSTRAINT "FK_688ecf20152dd2fe828f60a5604" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "talents" DROP CONSTRAINT "FK_688ecf20152dd2fe828f60a5604"`
    );
    await queryRunner.query(
      `ALTER TABLE "talents" DROP CONSTRAINT "FK_00e580ce176f1118857d1e8a964"`
    );
  }
}
