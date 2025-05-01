import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import process from 'node:process';
import axios from 'axios';
import { RequestContext } from '@core/infra/tracer/request.context';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    this.sendDiscordMessage(exception, host).catch(() => {});

    if (exception.status === 500 || !exception.status)
      Logger.error(exception.stack, 'ExceptionsHandler');

    exception.message = `Internal Server Error: ${exception.message}`;
    super.catch(exception, host);
  }

  private chunkString(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; i++, o += size) {
      chunks[i] = str.slice(o, o + size);
    }
    return chunks;
  }

  async sendDiscordMessage(exception: any, host: ArgumentsHost) {
    if (process.env.NODE_ENV === 'LOCAL') return;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const tracerId = RequestContext.getTracerId() || 'no-tracer-id';

    const errorDetails = {
      timestamp: new Date().toISOString(),
      method: request.method,
      endpoint: request.url,
      status: exception.status || 500,
      message: exception.message || 'Internal Server Error',
      stack: exception.stack || 'No stack trace available',
      userAgent: request.headers['user-agent']
    };

    if (
      errorDetails.message.includes('Cannot GET') ||
      errorDetails.message.includes('Cannot POST') ||
      (errorDetails.endpoint === '/users/info' &&
        errorDetails.status === 401) ||
      (errorDetails.endpoint === '/webhooks/helius' &&
        errorDetails.status === 400 &&
        errorDetails.message === 'Submission not found') ||
      (errorDetails.endpoint === '/users/balance' &&
        errorDetails.status === 400 &&
        errorDetails.message === 'User does not have wallet connected')
    )
      return;

    const stackChunks = this.chunkString(errorDetails.stack, 1000).map(
      (chunk, index) => ({
        name: `Stack Trace Part ${index + 1}`,
        value: `\`\`\`${chunk}\`\`\``
      })
    );

    if (exception.status < 500) {
      // axios
      //   .post(process.env.DISCORD_API_URL!, {
      //     content: `(${process.env.NODE_ENV}) [${tracerId}] Endpoint: ${errorDetails.endpoint}, Method: ${errorDetails.method}, status: ${errorDetails.status}, message: ${errorDetails.message}`
      //   })
      //   .catch(() => {});

      return;
    }

    const discordPayload = {
      embeds: [
        {
          title: `🚨 Error Occurred (${process.env.NODE_ENV})`,
          color: this.getColorForStatusCode(exception.status),
          fields: [
            {
              name: 'Timestamp',
              value: errorDetails.timestamp,
              inline: true
            },
            { name: 'Status', value: `${errorDetails.status}`, inline: true },
            { name: 'Method', value: errorDetails.method, inline: true },
            { name: 'Endpoint', value: errorDetails.endpoint, inline: true },
            { name: 'TraceId', value: tracerId, inline: true },
            {
              name: 'IP',
              value: errorDetails['ip'] ?? 'no IP',
              inline: true
            },
            {
              name: 'User-Agent',
              value: errorDetails.userAgent,
              inline: false
            },
            { name: 'Message', value: errorDetails.message, inline: false },
            ...stackChunks
          ]
        }
      ]
    };

    axios.post(process.env.DISCORD_API_URL!, discordPayload).catch(() => {});
  }

  private getColorForStatusCode(statusCode: number): number {
    if (statusCode >= 100 && statusCode < 200) return 0x5bc0de; // blue
    if (statusCode >= 200 && statusCode < 300) return 0x5cb85c; // green
    if (statusCode >= 300 && statusCode < 400) return 0xf0ad4e; // yellow
    if (statusCode >= 400 && statusCode < 500) return 0xffa500; // orange
    if (statusCode >= 500) return 0xff0000; // red
    return 0xff0000;
  }
}
