import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().min(1),
  REDIS_URL: z.string().min(1),
  MONGO_URI: z.string().min(1),

  SWAGGER_USER: z.string().min(1),
  SWAGGER_PASSWORD: z.string().min(1),
});
