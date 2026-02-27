import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import multipart from '@fastify/multipart';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JsonLoggerService } from './common/logging/json-logger.service';
import { buildSwaggerConfig } from './common/swagger/swagger.config';
import { protectSwaggerWithBasicAuth } from './common/swagger/swagger.basic-auth';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Graceful shutdown: NestJS calls onModuleDestroy() on SIGTERM/SIGINT,
  // which triggers BullMQ's built-in worker.close() + queue.close()
  app.enableShutdownHooks();

  const adapterHost = app.get(HttpAdapterHost);
  const logger = app.get(JsonLoggerService);
  const config = app.get(ConfigService);

  // Register multipart BEFORE any interceptors/pipes so streams are available
  await app.register(multipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024, // 2 GB
      files: 1,
    },
  });

  app.useGlobalFilters(new GlobalExceptionFilter(adapterHost, logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalPipes(new ZodValidationPipe());

  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
  const isProd = nodeEnv === 'production';
  const docsPath = '/docs';

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup(docsPath, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  if (isProd) {
    const swaggerUser = config.get<string>('SWAGGER_USER') ?? '';
    const swaggerPass = config.get<string>('SWAGGER_PASSWORD') ?? '';

    if (!swaggerUser || !swaggerPass) {
      throw new Error('SWAGGER_USER / SWAGGER_PASSWORD missing in production');
    }

    await protectSwaggerWithBasicAuth({ app, username: swaggerUser, password: swaggerPass, docsPath });
  }

  await app.listen(3000, '0.0.0.0');
}

void bootstrap();
