import { MigrationInterface, QueryRunner } from 'typeorm';
import { nftCollections } from '@core/infra/database/seeds/nft-collections';

export class CreateNftCollectionsTableMigration1733100579851
  implements MigrationInterface
{
  name = 'CreateNftCollectionsTableMigration1733100579851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nft_collections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "symbol" character varying NOT NULL, "name" character varying NOT NULL, "image_url" character varying NOT NULL, "is_verified" boolean NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97679fbae3fd322c7236bc5e60f" UNIQUE ("symbol"), CONSTRAINT "PK_fc1b262811ac2650e01dab48fe5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "nft_collection_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_fe8d2c3f4ac869ec161c10975c9" FOREIGN KEY ("nft_collection_id") REFERENCES "nft_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    const values = nftCollections
      .map(
        (collection) =>
          `('${collection.symbol}', '${collection.name}', '${collection.image_url}', ${collection.is_verified}, ${collection.is_active})`
      )
      .join(',');

    await queryRunner.query(
      `INSERT INTO "nft_collections" ("symbol", "name", "image_url", "is_verified", "is_active")
       VALUES ${values}
       ON CONFLICT ("symbol") DO NOTHING`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_fe8d2c3f4ac869ec161c10975c9"`
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "nft_collection_id"`
    );
    await queryRunner.query(`DROP TABLE "nft_collections"`);
  }
}
