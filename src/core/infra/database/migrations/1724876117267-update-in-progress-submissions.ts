import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInProgressSubmissionsMigration1724876117267
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const answerIds = await queryRunner.manager
      .createQueryBuilder('answers', 'a')
      .innerJoin('a.question', 'q')
      .select('a.id')
      .where('a.status = :status and q.is_open = :isOpen', {
        status: 'OPEN',
        isOpen: false
      })
      .getMany();

    const submissionsIds = await queryRunner.manager
      .createQueryBuilder('task_submissions', 'ts')
      .innerJoin('ts.task', 't')
      .select('ts.id')
      .where('ts.status = :status and t.is_open = :isOpen', {
        status: 'OPEN',
        isOpen: false
      })
      .getMany();

    const answerIdsToUpdate = answerIds.map((answer) => answer.id);
    const submissionIdsToUpdate = submissionsIds.map(
      (submission) => submission.id
    );

    await queryRunner.manager
      .createQueryBuilder()
      .update('answers')
      .set({ status: 'CLOSED' })
      .whereInIds(answerIdsToUpdate)
      .execute();

    await queryRunner.manager
      .createQueryBuilder()
      .update('task_submissions')
      .set({ status: 'CLOSED' })
      .whereInIds(submissionIdsToUpdate)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
