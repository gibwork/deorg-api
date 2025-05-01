import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import database from './database';

const databaseProviders = {
  provide: 'DATABASE_CONNECTION',
  useFactory: async () => {
    return database
      .initialize()
      .then(() => Logger.log('Database connected', 'Database'))
      .catch((error) => {
        Logger.error('Database connection error', 'Database');
        console.log(error);
        throw new Error(error);
      });
  }
};

@Module({
  providers: [databaseProviders]
})
export class DatabaseModule implements OnApplicationShutdown {
  onApplicationShutdown(): any {
    return database.destroy();
  }
}
