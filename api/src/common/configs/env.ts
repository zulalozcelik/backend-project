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
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
