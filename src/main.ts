import 'reflect-metadata';
import * as Sentry from '@sentry/node';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  // ---- 1. Initialize Sentry BEFORE creating the Nest app ----
  // This lets Sentry capture any error, anywhere in the app lifecycle.
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
  }

  const app = await NestFactory.create(AppModule);

  // ---- 2. Global validation pipe (rejects bad request bodies automatically) ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error if unknown properties are sent
      transform: true, // auto-transforms payloads to DTO instances
    }),
  );

  // ---- 3. Global exception filter that reports errors to Sentry ----
  app.useGlobalFilters(new SentryExceptionFilter());

  // ---- 4. Enable CORS so any frontend can call this API ----
  app.enableCors();

  // ---- 5. Swagger / OpenAPI documentation setup ----
  const config = new DocumentBuilder()
    .setTitle('AI Customer Support Chatbot API')
    .setDescription(
      'REST API for an AI-powered customer support chatbot. ' +
        'Includes chat (OpenAI), email (Resend), and monitoring (Sentry).',
    )
    .setVersion('1.0')
    .addTag('Chat', 'Send messages to the AI chatbot')
    .addTag('Email', 'Send transactional / summary emails via Resend')
    .addTag('Health', 'Health check & Sentry test endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📘 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
