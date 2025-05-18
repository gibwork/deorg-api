import axios, { AxiosInstance } from 'axios';
import * as process from 'node:process';

export class DiscordService {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.DISCORD_API_URL
    });
  }

  async sendMessage(message: string): Promise<void> {
    await this.api.post('', {
      content: `Deorg (${process.env.NODE_ENV}): ${message}`
    });
  }

  async sendAlertMessage(message: string): Promise<void> {
    await axios.post(process.env.DISCORD_ALERT_WEBHOOK_URL!, {
      content: `(${process.env.NODE_ENV}): ${message}`
    });
  }
}
