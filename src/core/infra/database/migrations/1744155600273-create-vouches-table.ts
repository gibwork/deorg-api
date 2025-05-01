import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVouchesTable1744155600273 implements MigrationInterface {
  name = 'CreateVouchesTable1744155600273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vouches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "rating" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "tip_amount" float NOT NULL DEFAULT 0,
        "created_by" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_vouches" PRIMARY KEY ("id")
      )`
    );

    await queryRunner.query(
      `ALTER TABLE "vouches" ADD CONSTRAINT "FK_vouches_created_by" 
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "vouches" ADD CONSTRAINT "FK_vouches_user_id" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vouches" DROP CONSTRAINT "FK_vouches_user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "vouches" DROP CONSTRAINT "FK_vouches_created_by"`
    );
    await queryRunner.query(`DROP TABLE "vouches"`);
  }
}
