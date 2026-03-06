import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  REDIS_URL: z.string(),
  MONGO_URI: z.string(),
  SWAGGER_USER: z.string(),
  SWAGGER_PASSWORD: z.string(),
  UPLOAD_DIR: z.string().optional().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().optional().default(2048),
  AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  GEMINI_BASE_URL: z.string().default('https://generativelanguage.googleapis.com/v1beta'),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
