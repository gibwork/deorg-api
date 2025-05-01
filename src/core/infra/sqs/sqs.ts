import {
  SqsConsumerOptions,
  SqsProducerOptions
} from '@ssut/nestjs-sqs/dist/sqs.types';
import * as AWS from 'aws-sdk';
import process from 'node:process';

export const TASK_CREATED_QUEUE = String(process.env.TASK_CREATED_QUEUE);
export const TASK_PAID_QUEUE = String(process.env.TASK_PAID_QUEUE);
export const EMAIL_QUEUE = String(process.env.EMAIL_QUEUE);

AWS.config.update({
  region: process.env.AWS_REGION
});

type QueueConfiguration = {
  producers: Array<SqsProducerOptions>;
  consumers: Array<SqsConsumerOptions>;
};

export const queues: QueueConfiguration = {
  producers: [],
  consumers: []
};

queues.producers.push({
  name: `${TASK_CREATED_QUEUE}`,
  queueUrl: `${process.env.SQS_BASE_URL}${TASK_CREATED_QUEUE}`,
  region: process.env.AWS_REGION
});

queues.producers.push({
  name: `${TASK_PAID_QUEUE}`,
  queueUrl: `${process.env.SQS_BASE_URL}${TASK_PAID_QUEUE}`,
  region: process.env.AWS_REGION
});

queues.producers.push({
  name: `${EMAIL_QUEUE}`,
  queueUrl: `${process.env.SQS_BASE_URL}${EMAIL_QUEUE}`,
  region: process.env.AWS_REGION
});
