import * as winston from 'winston';
import { LoggerConfig } from './logger.config';
import { green, yellow } from 'colorette';
import { Logform } from 'winston';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '@core/infra/tracer/request.context';

@Injectable()
export class ConsoleTransport {
  static create() {
    const isLocal = process.env.NODE_ENV === 'LOCAL';
    const formats: Logform.Format[] = [];

    formats.push(
      winston.format.timestamp({
        format: LoggerConfig.getDefaultLoggerTimezoned()
      })
    );

    if (isLocal) {
      formats.push(
        winston.format.colorize({
          colors: {
            info: 'blue',
            debug: 'yellow',
            error: 'red'
          }
        })
      );
    }

    formats.push(
      winston.format.printf((info) => {
        const tracerId = RequestContext.getTracerId() || 'no-tracer-id';

        const timestamp = info.timestamp;
        const level = info.level;
        const context = info.context ? info.context : info.stack;
        const message =
          typeof info.message == 'object'
            ? JSON.stringify(info.message)
            : info.message;

        return `[${level}] [${tracerId}] ${timestamp} ${
          isLocal ? yellow(`[${context}]`) : `[${context}]`
        } ${isLocal ? green(message) : message}`;
      })
    );

    return new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(...formats)
    });
  }
}
