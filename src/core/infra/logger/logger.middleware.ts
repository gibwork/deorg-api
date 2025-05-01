import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime;
      const { method, originalUrl, body, headers } = req;
      const { statusCode } = res;
      const contentLength = res.getHeader('Content-Length') || '';
      const userAgent = req.get('user-agent') || '';

      const logMessage = JSON.stringify({
        level: statusCode >= 400 ? 'ERROR' : 'INFO',
        timestamp: new Date().toISOString(),
        method,
        originalUrl,
        statusCode,
        contentLength,
        elapsedTime: `${elapsedTime}ms`,
        userAgent,
        user: req['user'],
        requestBody: body,
        requestHeaders: headers
      });

      if (statusCode >= 400) {
        Logger.error(logMessage, 'RequestError');
      }

      Logger.log(
        {
          message: `${req.method} ${req.originalUrl} ${res.statusCode} - Content-length: ${res.getHeader('Content-Length') || ''} - Agent: ${req.get('user-agent') || ''} - ${res.getHeader('X-Response-Time')}`
        },
        'Request'
      );
    });

    next();
  }
}
