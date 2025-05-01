import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBadgesTableMigration1723131552084
  implements MigrationInterface
{
  name = 'CreateBadgesTableMigration1723131552084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "badges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "image_url" character varying NOT NULL, "criteria" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_8a651318b8de577e8e217676466" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_badges_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_badge_id" uuid NOT NULL, CONSTRAINT "PK_271bc3820207cf8ba688275ac87" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_badges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "badge_id" uuid, CONSTRAINT "PK_0ca139216824d745a930065706a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user_badges_history" ADD CONSTRAINT "FK_9c327e2a8665cda71e68f2617c4" FOREIGN KEY ("user_badge_id") REFERENCES "user_badges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_badges" ADD CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_badges" ADD CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_badges" DROP CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_badges" DROP CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_badges_history" DROP CONSTRAINT "FK_9c327e2a8665cda71e68f2617c4"`
    );
    await queryRunner.query(`DROP TABLE "user_badges"`);
    await queryRunner.query(`DROP TABLE "user_badges_history"`);
    await queryRunner.query(`DROP TABLE "badges"`);
  }
}
