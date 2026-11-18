import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentModule } from '../config/environment.module.js';

@Module({
  imports: [
    EnvironmentModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
