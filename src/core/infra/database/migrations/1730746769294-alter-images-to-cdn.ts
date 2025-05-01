import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterImagesToCdnMigration1730746769294
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE tasks
        SET metadata_image = CASE
         WHEN metadata_image LIKE 'https://gibwork-dev.s3.amazonaws.com%' THEN regexp_replace(
           metadata_image,
           'https://gibwork-dev\\.s3\\.amazonaws\\.com',
           'https://dev.cdn.gib.work'
                                                                               )
         WHEN metadata_image LIKE 'https://gibwork-prod.s3.amazonaws.com%' THEN regexp_replace(
           metadata_image,
           'https://gibwork-prod\\.s3\\.amazonaws\\.com',
           'https://cdn.gib.work'
                                                                                )
         ELSE metadata_image
        END,
        blinks_image = CASE
           WHEN blinks_image LIKE 'https://gibwork-dev.s3.amazonaws.com%' THEN regexp_replace(
             blinks_image,
             'https://gibwork-dev\\.s3\\.amazonaws\\.com',
             'https://dev.cdn.gib.work'
                                                                               )
           WHEN blinks_image LIKE 'https://gibwork-prod.s3.amazonaws.com%' THEN regexp_replace(
             blinks_image,
             'https://gibwork-prod\\.s3\\.amazonaws\\.com',
             'https://cdn.gib.work'
                                                                                )
           ELSE blinks_image
        END;
    `);

    await queryRunner.query(`
        UPDATE bounties
        SET metadata_image = CASE
             WHEN metadata_image LIKE 'https://gibwork-dev.s3.amazonaws.com%' THEN regexp_replace(
               metadata_image,
               'https://gibwork-dev\\.s3\\.amazonaws\\.com',
               'https://dev.cdn.gib.work'
                                                                                   )
             WHEN metadata_image LIKE 'https://gibwork-prod.s3.amazonaws.com%' THEN regexp_replace(
               metadata_image,
               'https://gibwork-prod\\.s3\\.amazonaws\\.com',
               'https://cdn.gib.work'
                                                                                    )
             ELSE metadata_image
        END;
    `);

    // Atualização na tabela services
    await queryRunner.query(`
            UPDATE services
            SET images = array(
                SELECT regexp_replace(
          image,
          'https://gibwork-dev\\.s3\\.amazonaws\\.com',
          'https://dev.cdn.gib.work'
        )
        FROM unnest(images) AS image
      )
            WHERE EXISTS (
                SELECT 1
                FROM unnest(images) AS image
                WHERE image LIKE 'https://gibwork-dev.s3.amazonaws.com%'
            );

            UPDATE services
            SET images = array(
                SELECT regexp_replace(
          image,
          'https://gibwork-prod\\.s3\\.amazonaws\\.com',
          'https://cdn.gib.work'
        )
        FROM unnest(images) AS image
      )
            WHERE EXISTS (
                SELECT 1
                FROM unnest(images) AS image
                WHERE image LIKE 'https://gibwork-prod.s3.amazonaws.com%'
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE tasks
        SET metadata_image = CASE
         WHEN metadata_image LIKE 'https://dev.cdn.gib.work%' THEN regexp_replace(
           metadata_image,
           'https://dev\\.cdn\\.gib\\.work',
           'https://gibwork-dev.s3.amazonaws.com'
                                                                   )
         WHEN metadata_image LIKE 'https://cdn.gib.work%' THEN regexp_replace(
           metadata_image,
           'https://cdn\\.gib\\.work',
           'https://gibwork-prod.s3.amazonaws.com'
                                                               )
         ELSE metadata_image
        END,
        blinks_image = CASE
           WHEN blinks_image LIKE 'https://dev.cdn.gib.work%' THEN regexp_replace(
             blinks_image,
             'https://dev\\.cdn\\.gib\\.work',
             'https://gibwork-dev.s3.amazonaws.com'
                                                                   )
           WHEN blinks_image LIKE 'https://cdn.gib.work%' THEN regexp_replace(
             blinks_image,
             'https://cdn\\.gib\\.work',
             'https://gibwork-prod.s3.amazonaws.com'
                                                               )
           ELSE blinks_image
        END;
    `);

    await queryRunner.query(`
        UPDATE bounties
        SET metadata_image = CASE
         WHEN metadata_image LIKE 'https://dev.cdn.gib.work%' THEN regexp_replace(
           metadata_image,
           'https://dev\\.cdn\\.gib\\.work',
           'https://gibwork-dev.s3.amazonaws.com'
                                                                   )
         WHEN metadata_image LIKE 'https://cdn.gib.work%' THEN regexp_replace(
           metadata_image,
           'https://cdn\\.gib\\.work',
           'https://gibwork-prod.s3.amazonaws.com'
                                                               )
         ELSE metadata_image
        END;
    `);

    await queryRunner.query(`
            UPDATE services
            SET images = array(
                SELECT regexp_replace(
          image,
          'https://dev\\.cdn\\.gib\\.work',
          'https://gibwork-dev.s3.amazonaws.com'
        )
        FROM unnest(images) AS image
      )
            WHERE EXISTS (
                SELECT 1
                FROM unnest(images) AS image
                WHERE image LIKE 'https://dev.cdn.gib.work%'
            );

            UPDATE services
            SET images = array(
                SELECT regexp_replace(
          image,
          'https://cdn\\.gib\\.work',
          'https://gibwork-prod.s3.amazonaws.com'
        )
        FROM unnest(images) AS image
      )
            WHERE EXISTS (
                SELECT 1
                FROM unnest(images) AS image
                WHERE image LIKE 'https://cdn.gib.work%'
            );
        `);
  }
}
