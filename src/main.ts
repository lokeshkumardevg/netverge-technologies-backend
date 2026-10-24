
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  const allowedOrigins = (
    'http://localhost:3001,http://localhost:3000,https://netverge.tech,https://www.netverge.tech,https://netverge.wheedletechnologies.ai'
  )
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = Number(process.env.PORT) || 5010;

  await app.listen(port, '127.0.0.1');

  console.log(`NetVerge API running on http://localhost:${port}/api`);
}

bootstrap();
