import type { DataSourceOptions } from 'typeorm';

export function databaseOptions(env: NodeJS.ProcessEnv) {
  return {
    type: 'postgres',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT ?? 5432),
    username: env.DB_USERNAME ?? 'postgres',
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE ?? 'mediconnect',
    synchronize: false,
  } satisfies DataSourceOptions;
}
