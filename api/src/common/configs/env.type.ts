import { z } from 'zod';
import { envSchema } from './env.schema';

export type EnvironmentVariables = z.infer<typeof envSchema>;
