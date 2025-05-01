import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1721503723962 implements MigrationInterface {
    name = 'InitMigration1721503723962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "requirements" character varying NOT NULL, "tags" text array NOT NULL, "vault_id" character varying NOT NULL, "asset_id" uuid NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "transaction_id" character varying NOT NULL, CONSTRAINT "REL_474f2554d7097528d0db54d561" UNIQUE ("asset_id"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL, "content" character varying NOT NULL, "status" character varying NOT NULL, "asset_id" uuid, "transaction_id" uuid, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_f99ec7cf00720d6889fbdf68a8" UNIQUE ("asset_id"), CONSTRAINT "REL_569a3e6c734fef151f5918956a" UNIQUE ("transaction_id"), CONSTRAINT "PK_8d19d6b5dd776e373113de50018" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bounty_metadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL, "data" jsonb, CONSTRAINT "PK_7da5fb1ebf3f1e5e8da5103f9cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bounties_type_enum" AS ENUM('githubOssIssue', 'githubOssRepo')`);
        await queryRunner.query(`CREATE TABLE "bounties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."bounties_type_enum" NOT NULL DEFAULT 'githubOssIssue', "title" character varying NOT NULL, "external_url" character varying NOT NULL, "overview" character varying NOT NULL, "requirements" character varying NOT NULL, "ends_at" TIMESTAMP NOT NULL, "tags" text array NOT NULL, "is_open" boolean NOT NULL, "vault_id" character varying NOT NULL, "asset_id" uuid NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "transaction_id" character varying NOT NULL, "metadata_id" uuid NOT NULL, CONSTRAINT "REL_5e7167c9d59d1efed3428b2202" UNIQUE ("metadata_id"), CONSTRAINT "REL_03cf59aa7389777295a5b22ac3" UNIQUE ("asset_id"), CONSTRAINT "PK_335c87017bcb2fa9bc15678f385" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bounty_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bounty_id" uuid NOT NULL, "status" character varying NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a0ebefd6245c8e31ef9d5690c83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bounty_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bounty_id" character varying, "bounty_submission_id" uuid NOT NULL, "is_approved" boolean NOT NULL DEFAULT false, "gh_fork_details" jsonb NOT NULL, "gh_pull_request_details" jsonb, "transaction_id" uuid, "asset_id" uuid, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "closed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_1c442a616386a9a0cc3dc9671b" UNIQUE ("asset_id"), CONSTRAINT "REL_1fe1e2efbdb8c5a60f92a82165" UNIQUE ("transaction_id"), CONSTRAINT "PK_4625a38eda86606d1c0d2a71e3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('deposit', 'withdraw', 'refund')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "asset_id" uuid NOT NULL, "vault_id" character varying NOT NULL, "xcrow_transaction_id" character varying NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "xcrow_request" jsonb NOT NULL, "xcrow_response" jsonb NOT NULL, "status_code" integer NOT NULL, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mint_address" character varying NOT NULL, "symbol" character varying NOT NULL, "image_url" character varying NOT NULL, "amount" bigint NOT NULL, "price" double precision NOT NULL DEFAULT '0', "decimals" integer NOT NULL, CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "content" character varying NOT NULL, "answer_id" character varying, "asset_id" uuid, "transaction_id" uuid, "status" character varying NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2917a6010606cab58624d2fff2" UNIQUE ("asset_id"), CONSTRAINT "REL_2b3d95e83a876d2a69636c38b0" UNIQUE ("transaction_id"), CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" character varying NOT NULL, "category" character varying NOT NULL, "status" character varying NOT NULL, "tags" text array NOT NULL, "vault_id" character varying NOT NULL, "asset_id" uuid NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "transaction_id" character varying NOT NULL, CONSTRAINT "REL_f24fa7dddfee9e2c62a5d2094d" UNIQUE ("asset_id"), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "profile_picture" character varying NOT NULL, "external_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "total_amount_earned" double precision NOT NULL DEFAULT '0', "total_amount_spent" double precision NOT NULL DEFAULT '0', "github_metadata" jsonb, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_474f2554d7097528d0db54d5618" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_8f60d8b9923cce1bb153bc9b296" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_d6cfaee118a0300d652e28ee166" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_f99ec7cf00720d6889fbdf68a84" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_submissions" ADD CONSTRAINT "FK_569a3e6c734fef151f5918956a9" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounties" ADD CONSTRAINT "FK_b48d26c8b80e7e963521d2758a6" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounties" ADD CONSTRAINT "FK_5e7167c9d59d1efed3428b22026" FOREIGN KEY ("metadata_id") REFERENCES "bounty_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounties" ADD CONSTRAINT "FK_03cf59aa7389777295a5b22ac3e" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_submissions" ADD CONSTRAINT "FK_ac6184d85c583e90ba832e5e231" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_submissions" ADD CONSTRAINT "FK_b243dcb30ac26827ab67f9af739" FOREIGN KEY ("bounty_id") REFERENCES "bounties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" ADD CONSTRAINT "FK_f60c8bf5b84f3c2c1f1086c00a2" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" ADD CONSTRAINT "FK_81c2e9b7f62a619035757f624ac" FOREIGN KEY ("bounty_submission_id") REFERENCES "bounty_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" ADD CONSTRAINT "FK_1c442a616386a9a0cc3dc9671bf" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" ADD CONSTRAINT "FK_1fe1e2efbdb8c5a60f92a82165f" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_77e84561125adeccf287547f66e" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_92904cc4ab661f087cbcb60f404" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_b9906a009ce76fa612e7f4d8bb7" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_2917a6010606cab58624d2fff2c" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_2b3d95e83a876d2a69636c38b09" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_7d0fdceddfeebcc65d61b2f4c70" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_f24fa7dddfee9e2c62a5d2094df" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_f24fa7dddfee9e2c62a5d2094df"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_7d0fdceddfeebcc65d61b2f4c70"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_2b3d95e83a876d2a69636c38b09"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_2917a6010606cab58624d2fff2c"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_677120094cf6d3f12df0b9dc5d3"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_b9906a009ce76fa612e7f4d8bb7"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_92904cc4ab661f087cbcb60f404"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_77e84561125adeccf287547f66e"`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" DROP CONSTRAINT "FK_1fe1e2efbdb8c5a60f92a82165f"`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" DROP CONSTRAINT "FK_1c442a616386a9a0cc3dc9671bf"`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" DROP CONSTRAINT "FK_81c2e9b7f62a619035757f624ac"`);
        await queryRunner.query(`ALTER TABLE "bounty_attempts" DROP CONSTRAINT "FK_f60c8bf5b84f3c2c1f1086c00a2"`);
        await queryRunner.query(`ALTER TABLE "bounty_submissions" DROP CONSTRAINT "FK_b243dcb30ac26827ab67f9af739"`);
        await queryRunner.query(`ALTER TABLE "bounty_submissions" DROP CONSTRAINT "FK_ac6184d85c583e90ba832e5e231"`);
        await queryRunner.query(`ALTER TABLE "bounties" DROP CONSTRAINT "FK_03cf59aa7389777295a5b22ac3e"`);
        await queryRunner.query(`ALTER TABLE "bounties" DROP CONSTRAINT "FK_5e7167c9d59d1efed3428b22026"`);
        await queryRunner.query(`ALTER TABLE "bounties" DROP CONSTRAINT "FK_b48d26c8b80e7e963521d2758a6"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_569a3e6c734fef151f5918956a9"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_f99ec7cf00720d6889fbdf68a84"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_d6cfaee118a0300d652e28ee166"`);
        await queryRunner.query(`ALTER TABLE "task_submissions" DROP CONSTRAINT "FK_8f60d8b9923cce1bb153bc9b296"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_474f2554d7097528d0db54d5618"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "answers"`);
        await queryRunner.query(`DROP TABLE "assets"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "bounty_attempts"`);
        await queryRunner.query(`DROP TABLE "bounty_submissions"`);
        await queryRunner.query(`DROP TABLE "bounties"`);
        await queryRunner.query(`DROP TYPE "public"."bounties_type_enum"`);
        await queryRunner.query(`DROP TABLE "bounty_metadata"`);
        await queryRunner.query(`DROP TABLE "task_submissions"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
    }

}
