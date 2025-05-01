import { Injectable, Logger } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { randomUUID } from 'node:crypto';

@Injectable()
export class EventSQS {
  private logger: Logger;

  constructor(private readonly sqsService: SqsService) {
    this.logger = new Logger(SqsService.name);
  }

  async sendMessage(queue: string, message: any) {
    try {
      this.logger.log(`Sending message to queue ${queue}`);
      await this.sqsService.send(queue, {
        id: randomUUID(),
        body: JSON.stringify(message)
      });
    } catch (error) {
      console.log(error);
      this.logger.error(`Error sending message to queue ${queue}`, error);
    }
  }
}
