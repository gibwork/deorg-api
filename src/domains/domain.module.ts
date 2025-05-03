import { CoreModule } from '@core/core.module';
import { TracerMiddleware } from '@core/infra/tracer/tracer.middleware';
import { ServiceProvider } from '@core/service-provider';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersProvider } from './users/users.provider';
import { AuthProvider } from './auth/auth.provider';
import { OrganizationsProvider } from './organizations/organizations.provider';
import { TransactionsProvider } from './transactions/transactions.provider';
import { ProposalsProvider } from './proposals/proposal.provider';
import { TokensProvider } from './tokens/tokens.provider';
import { ProjectsProvider } from './projects/projects.provider';

const serviceProvider = ServiceProvider.buildByProviders([
  UsersProvider,
  AuthProvider,
  OrganizationsProvider,
  TransactionsProvider,
  ProposalsProvider,
  TokensProvider,
  ProjectsProvider
]);
serviceProvider.addImport(CoreModule);

@Module(serviceProvider.getModule())
export class DomainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracerMiddleware).forRoutes('*');
  }
}
