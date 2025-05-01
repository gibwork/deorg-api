import * as winston from 'winston';
import { LoggerConfig } from './logger.config';
import { WinstonModule } from 'nest-winston';
import * as Transport from 'winston-transport';
import { LoggerService } from '@nestjs/common';

export class LoggerDefault {
  static getDefaultLogger(transports: Transport[]): LoggerService {
    return WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: LoggerConfig.getDefaultLoggerTimezoned()
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      transports
    });
  }
}
