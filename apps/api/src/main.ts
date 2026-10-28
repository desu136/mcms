import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { API_PREFIX } from '@mcms/domain';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix: /api/v1
  app.setGlobalPrefix(API_PREFIX.replace(/^\//, ''));

  // CORS for web client, desktop client, and mobile clients
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'app://electron'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-MCMS-Sync-Cursor'],
  });

  // Strict validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.API_PORT || 3001;
  await app.listen(port);
  logger.log(`MCMS API is running on http://localhost:${port}/${API_PREFIX.replace(/^\//, '')}`);
  logger.log(`Health check available at http://localhost:${port}/api/v1/health`);
}

void bootstrap();
