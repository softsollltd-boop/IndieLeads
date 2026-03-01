import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { json, urlencoded } from 'express';

import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
    logger.log('Sentry Error Tracking initialized.');
  }

  // Use default options
  const app = await NestFactory.create(AppModule);

  // CRITICAL: Explicitly handle JSON body parsing to prevent empty payloads
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  const corsLogger = new Logger('CORS');
  app.enableCors({
    origin: (origin, callback) => {
      const frontendUrl = process.env.FRONTEND_URL;
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://localhost',
      ];

      // Add frontendUrl to allowed if exists
      if (frontendUrl) allowedOrigins.push(frontendUrl);

      if (!origin || allowedOrigins.includes(origin) || (frontendUrl && origin === frontendUrl)) {
        callback(null, true);
      } else {
        corsLogger.warn(`Blocked Origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,x-workspace-id,x-request-id',
  });

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      validationError: { target: false, value: false },
    }),
  );

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`IndieLeads API is running on port: ${port}`);
}

bootstrap();