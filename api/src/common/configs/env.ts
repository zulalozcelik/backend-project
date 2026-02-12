import { envSchema } from './env.schema';
import { EnvironmentVariables } from './env.type';

export function validateEnv(): EnvironmentVariables & {
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
} {
  const validated = envSchema.parse(process.env);

  return {
    ...validated,
    isProduction: validated.NODE_ENV === 'production',
    isDevelopment: validated.NODE_ENV === 'development',
    isStaging: validated.NODE_ENV === 'staging',
  };
}
