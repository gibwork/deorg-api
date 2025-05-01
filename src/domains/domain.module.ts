import { CoreModule } from '@core/core.module';
import { TracerMiddleware } from '@core/infra/tracer/tracer.middleware';
import { ServiceProvider } from '@core/service-provider';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

const serviceProvider = ServiceProvider.buildByProviders([]);
serviceProvider.addImport(CoreModule);

@Module(serviceProvider.getModule())
export class DomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracerMiddleware).forRoutes('*');
  }
}
