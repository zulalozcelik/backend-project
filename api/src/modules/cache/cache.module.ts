import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { CacheInterceptor } from './cache.interceptor';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class CacheModule {}
