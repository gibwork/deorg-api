import * as redisStore from 'cache-manager-redis-store';
import { env } from 'node:process';

export const isCacheEnabled: boolean = env.CACHE_ENABLE?.toString() === 'true';
export const redisHost: string = env.REDIS_HOST ?? 'localhost';
export const redisPort: number = env.REDIS_PORT
  ? parseInt(String(env.REDIS_PORT))
  : 6379;
export const redisPassword: string = env.REDIS_PASSWORD ?? '';

type RedisConfig = {
  isGlobal: boolean;
  store: any;
  url: string;
  ttl: number;
  enable: boolean;
  socket: {
    tls: boolean;
  };
};

export const redisConfig: RedisConfig = {
  isGlobal: true,
  store: redisStore,
  url: redisPassword
    ? `redis://default:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`,
  ttl: env.REDIS_TTL ? parseInt(String(env.REDIS_TTL)) : 3600,
  enable: isCacheEnabled,
  socket: {
    tls: false
  }
};
