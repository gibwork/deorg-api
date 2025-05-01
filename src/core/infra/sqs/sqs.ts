import {
  SqsConsumerOptions,
  SqsProducerOptions
} from '@ssut/nestjs-sqs/dist/sqs.types';
import * as AWS from 'aws-sdk';
import process from 'node:process';

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
