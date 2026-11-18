import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const swagger = new DocumentBuilder()
    .setTitle('MediConnect API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const createSwaggerDocument = () =>
    SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, createSwaggerDocument);
  SwaggerModule.setup('docs', app, createSwaggerDocument);
  await app.listen(Number(process.env.PORT ?? 3000));
}
await bootstrap();
