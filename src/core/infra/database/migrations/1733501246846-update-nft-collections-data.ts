import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNftCollectionsDataMigration1733501246846
  implements MigrationInterface
{
  name = 'UpdateNftCollectionsDataMigration1733501246846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE nft_collections set is_active = false`);
    await queryRunner.query(
      `UPDATE nft_collections set is_active = true, address = '5PA96eCFHJSFPY9SWFeRJUHrpoNF5XZL6RrE1JADXhxf', image_url = 'https://cdn.gib.work/nft-images/collections/tensorians.gif' where symbol = 'tensorians'`
    );
    await queryRunner.query(
      `UPDATE nft_collections set is_active = true, address = 'J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w', image_url = 'https://cdn.gib.work/nft-images/collections/mad-lads.png' where symbol = 'mad_lads'`
    );
    await queryRunner.query(
      `UPDATE nft_collections set is_active = true, address = 'J6RJFQfLgBTcoAt3KoZFiTFW9AbufsztBNDgZ7Znrp1Q', image_url = 'https://cdn.gib.work/nft-images/collections/galactic-geckos.png' where symbol = 'galactic_geckos'`
    );
    await queryRunner.query(
      `UPDATE nft_collections set is_active = true, address = 'SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W', image_url = 'https://cdn.gib.work/nft-images/collections/smbs.png' where symbol = 'solana_monkey_business'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
