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
      content: `Gibwork (${process.env.NODE_ENV}): ${message}`
    });
  }

  async sendAlertMessage(message: string): Promise<void> {
    await axios.post(
      'https://discord.com/api/webhooks/1304232156763263096/sZ5fH-b3sG_ybABUBXlb1WFKIDeFH3M_YsNFxWDOf_hlIkX5cIA6l24dl6ppxFJRsvsg',
      {
        content: `(${process.env.NODE_ENV}): ${message}`
      }
    );
  }
}
