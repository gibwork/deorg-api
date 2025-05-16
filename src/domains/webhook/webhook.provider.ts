import { ModuleMetadata } from '@nestjs/common';
import { WebhookController } from './webhook.controller';

export const WebhookProvider: ModuleMetadata = {
  controllers: [WebhookController],
  providers: []
};
