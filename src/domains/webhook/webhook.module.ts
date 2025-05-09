import { ModuleMetadata } from '@nestjs/common';
import { WebhookController } from './webhook.controller';

export const WebhookModule: ModuleMetadata = {
  controllers: [WebhookController],
  providers: []
};
