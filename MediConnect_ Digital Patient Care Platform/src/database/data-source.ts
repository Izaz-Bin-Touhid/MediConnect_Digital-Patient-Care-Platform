import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { databaseOptions } from '../config/database.config.js';
import { validateEnvironment } from '../config/environment.js';

if (existsSync('.env')) {
  loadEnvFile();
}
validateEnvironment(process.env);

const entities = fileURLToPath(
  new URL('../**/entities/*.entity.js', import.meta.url),
).replaceAll('\\', '/');
const migrations = fileURLToPath(
  new URL('./migrations/*.js', import.meta.url),
).replaceAll('\\', '/');

export default new DataSource({
  ...databaseOptions(process.env),
  entities: [entities],
  migrations: [migrations],
});
