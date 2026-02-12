import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

export const createDrizzleClient = (configService: ConfigService) => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = postgres(databaseUrl, {
    max: 10,
  });

  return drizzle(sql, { schema });
};
