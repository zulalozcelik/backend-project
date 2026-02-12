import { Injectable } from '@nestjs/common';
import { env } from './env';

@Injectable()
export class AppConfigService {
  readonly databaseUrl = env.DATABASE_URL;
  readonly jwtSecret = env.JWT_SECRET;
  readonly redisUrl = env.REDIS_URL;

  readonly swaggerUser = env.SWAGGER_USER;
  readonly swaggerPassword = env.SWAGGER_PASSWORD;
  readonly isProduction = env.NODE_ENV === 'production';
}
