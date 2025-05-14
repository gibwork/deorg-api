import { CoreModule } from '@core/core.module';
import { TracerMiddleware } from '@core/infra/tracer/tracer.middleware';
import { ServiceProvider } from '@core/service-provider';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap
} from '@nestjs/common';
import { UsersProvider } from './users/users.provider';
import { AuthProvider } from './auth/auth.provider';
import { OrganizationsProvider } from './organizations/organizations.provider';
import { TransactionsProvider } from './transactions/transactions.provider';
import { ProposalsProvider } from './proposals/proposal.provider';
import { TokensProvider } from './tokens/tokens.provider';
import { ProjectsProvider } from './projects/projects.provider';
import { TasksProvider } from './tasks/tasks.provider';
import { socketProvider } from './gateway/socket.provider';
import { ProgramProvider } from './program/program.provider';
import { ProgramListener } from './program/program.listener';

const serviceProvider = ServiceProvider.buildByProviders([
  UsersProvider,
  AuthProvider,
  OrganizationsProvider,
  TransactionsProvider,
  ProposalsProvider,
  TokensProvider,
  ProjectsProvider,
  TasksProvider,
  socketProvider,
  ProgramProvider
]);
serviceProvider.addImport(CoreModule);

@Module(serviceProvider.getModule())
export class DomainModule implements OnApplicationBootstrap, NestModule {
  constructor(private readonly programListener: ProgramListener) {}

  async onApplicationBootstrap() {
    await this.waitForWebSocketReady();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracerMiddleware).forRoutes('*');
  }

  private async waitForWebSocketReady(): Promise<void> {
    const RETRY_INTERVAL = 1000;

    while (this.programListener.getWsStatus() !== WebSocket.OPEN) {
      console.log(
        `WebSocket not ready. Retrying in ${RETRY_INTERVAL / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }

    console.log('WebSocket is ready.');
    this.startMonitoring();
  }

  startMonitoring() {
    this.programListener.startMonitoring().catch((error) => {
      console.log(error);
      Logger.log('Error on programListener', 'DomainModule');
    });
  }
}
