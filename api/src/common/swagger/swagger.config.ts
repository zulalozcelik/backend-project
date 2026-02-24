import { DocumentBuilder } from '@nestjs/swagger';

export function buildSwaggerConfig() {
    return new DocumentBuilder()
        .setTitle('Backend API')
        .setDescription('Production-level NestJS API (Fastify + Drizzle + Zod)')
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
            },
            'bearer',
        )
        .build();
}
