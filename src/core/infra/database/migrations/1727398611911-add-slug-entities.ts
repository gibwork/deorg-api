import { MigrationInterface, QueryRunner } from 'typeorm';
import slugify from 'slugify';

export class AddSlugEntitiesMigration1727398611911
  implements MigrationInterface
{
  name = 'AddSlugEntitiesMigration1727398611911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "slug" character varying`);
    await queryRunner.query(
      `ALTER TABLE "bounties" ADD "slug" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD "slug" character varying`
    );

    const generateRandomString = (length: number): string => {
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    };

    const generateUniqueSlug = async (
      queryRunner: QueryRunner,
      tableName: string,
      baseSlug: string
    ): Promise<string> => {
      let slug = baseSlug;

      let exists = await queryRunner.query(
        `SELECT 1 FROM "${tableName}" WHERE slug = $1`,
        [slug]
      );

      while (exists.length > 0) {
        const randomString = generateRandomString(5);
        slug = `${baseSlug}-${randomString}`;
        exists = await queryRunner.query(
          `SELECT 1 FROM "${tableName}" WHERE slug = $1`,
          [slug]
        );
      }

      return slug;
    };

    const tasks = await queryRunner.query(`SELECT id, title FROM "tasks"`);
    for (const task of tasks) {
      const slug = await generateUniqueSlug(
        queryRunner,
        'tasks',
        slugify(task.title, { lower: true, strict: true })
      );
      await queryRunner.query(`UPDATE "tasks" SET slug = $1 WHERE id = $2`, [
        slug,
        task.id
      ]);
    }

    const bounties = await queryRunner.query(
      `SELECT id, title FROM "bounties"`
    );
    for (const bounty of bounties) {
      const slug = await generateUniqueSlug(
        queryRunner,
        'bounties',
        slugify(bounty.title, { lower: true, strict: true })
      );
      await queryRunner.query(`UPDATE "bounties" SET slug = $1 WHERE id = $2`, [
        slug,
        bounty.id
      ]);
    }

    const services = await queryRunner.query(
      `SELECT id, title FROM "services"`
    );
    for (const service of services) {
      const slug = await generateUniqueSlug(
        queryRunner,
        'services',
        slugify(service.title, { lower: true, strict: true })
      );
      await queryRunner.query(`UPDATE "services" SET slug = $1 WHERE id = $2`, [
        slug,
        service.id
      ]);
    }

    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "slug" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "bounties" ALTER COLUMN "slug" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "services" ALTER COLUMN "slug" SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE "bounties" ADD CONSTRAINT "UQ_df5a6f9dcbfc042797af0d1b6b6" UNIQUE ("slug")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "slug"`);
    await queryRunner.query(
      `ALTER TABLE "bounties" DROP CONSTRAINT "UQ_df5a6f9dcbfc042797af0d1b6b6"`
    );
    await queryRunner.query(`ALTER TABLE "bounties" DROP COLUMN "slug"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "slug"`);
  }
}
