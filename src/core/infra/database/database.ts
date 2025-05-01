import dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';
import process from 'node:process';

const database = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' && {
    rejectUnauthorized: false
  },
  synchronize: false,
  migrationsRun:
    process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'PROD',
  logging: process.env.DEBUG_QUERY === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    path.join(__dirname, '../../../domains/**/entities/*.entity{.ts,.js}')
  ],
  migrations: [path.resolve(__dirname, 'migrations', '*.{ts,js}')]
});

export default database;
