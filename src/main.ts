import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { LoggerMiddleware } from '@core/infra/logger/logger.middleware';
import { LoggerDefault } from '@core/infra/logger/logger.default';
import { ConsoleTransport } from '@core/infra/logger/logger-console.transport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import packageJSON from '../package.json';
import dotenv from 'dotenv';
import { GlobalExceptionFilter } from '@core/infra/http-filter/global-exception.filter';
import { ApplicationModule } from './application.module';
import { HttpBadRequestExceptionFilter } from '@core/infra/http-filter/http-bad-request-exception-filter';
import { rateLimit } from 'express-rate-limit';
dotenv.config();

class ServerBootstrap {
  app: INestApplication;

  async bootstrap() {
    this.app = await NestFactory.create(ApplicationModule, {
      bufferLogs: true,
      cors: true
    });

    const logger = LoggerDefault.getDefaultLogger([ConsoleTransport.create()]);

    this.app.useLogger(logger);

    this.configPipes();
    this.configGlobalExceptionFilter();
    this.configMiddlewares();
    this.configRequestLogger();
    if (process.env.NODE_ENV === 'LOCAL' || process.env.NODE_ENV === 'DEV')
      this.configSwagger();
    // this.configRateLimit();

    await this.app.listen(process.env.PORT || 3333);
  }

  private configMiddlewares(): void {
    this.app.use(bodyParser.json());

    process.on('uncaughtException', (err) => {
      Logger.error(
        err.message,
        JSON.stringify(err.stack),
        'Uncaught Exception thrown'
      );
      Logger.log(err.stack);
    });
  }

  private configRequestLogger(): void {
    const logger = new LoggerMiddleware();
    this.app.use(responseTime());
    this.app.use(logger.use);
  }

  private configGlobalExceptionFilter(): void {
    const { httpAdapter } = this.app.get(HttpAdapterHost);
    this.app.useGlobalFilters(new HttpBadRequestExceptionFilter(httpAdapter));
    this.app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));
  }

  private configPipes() {
    this.app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
  }

  private configSwagger() {
    const config = new DocumentBuilder()
      .setTitle(packageJSON.name)
      .setDescription(packageJSON.description)
      .setVersion(packageJSON.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        'access-token'
      )
      .build();

    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('/docs', this.app, document, {
      swaggerOptions: {
        persistAuthorization: true // this
      }
    });
  }
  private configRateLimit() {
    const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      limit: 50, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
      legacyHeaders: false,
      handler: (req, res) => {
        const ip =
          req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        Logger.warn(`Rate limit exceeded for IP: ${ip}`);
        res.status(429).send('Too many requests');
      }
    });

    this.app.use(limiter);
  }
}

new ServerBootstrap().bootstrap().catch((error) => {
  console.log({ error });
  console.log('Error on bootstrap');
});
