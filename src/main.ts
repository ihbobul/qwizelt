import * as cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({ credentials: true, origin: 'http://localhost:3000' });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(8080);
}

bootstrap();
