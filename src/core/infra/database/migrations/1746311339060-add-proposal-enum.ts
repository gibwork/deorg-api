import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalEnum1746311339060 implements MigrationInterface {
  name = 'AddProposalEnum1746311339060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."proposals_type_enum" AS ENUM('CONTRIBUTOR', 'PROJECT')`
    );
    await queryRunner.query(
      `ALTER TABLE "proposals" ADD "type" "public"."proposals_type_enum" NOT NULL DEFAULT 'CONTRIBUTOR'`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_members_role_enum" RENAME TO "organization_members_role_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_role_enum" AS ENUM('ADMIN', 'MEMBER', 'CONTRIBUTOR')`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" TYPE "public"."organization_members_role_enum" USING "role"::"text"::"public"."organization_members_role_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_members_role_enum_old"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organization_members_role_enum_old" AS ENUM('ADMIN', 'MEMBER')`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" TYPE "public"."organization_members_role_enum_old" USING "role"::"text"::"public"."organization_members_role_enum_old"`
    );
    await queryRunner.query(
      `ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'MEMBER'`
    );
    await queryRunner.query(
      `DROP TYPE "public"."organization_members_role_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."organization_members_role_enum_old" RENAME TO "organization_members_role_enum"`
    );
    await queryRunner.query(`ALTER TABLE "proposals" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."proposals_type_enum"`);
  }
}
