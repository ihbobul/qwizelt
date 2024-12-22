import * as cookieParser from 'cookie-parser';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({ credentials: true, origin: 'https://frontend.qwizelt.me' });

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('/v1/api');

  await app.listen(3000);
}

bootstrap();
