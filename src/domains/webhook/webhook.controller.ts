import { Body, Controller, Post } from '@nestjs/common';

@Controller('webhook')
export class WebhookController {
  @Post()
  async handleWebhook(@Body() body: any) {
    console.log('webhook received', body);
  }
}
