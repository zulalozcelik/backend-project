// api/src/modules/cache/cache.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { CacheInterceptor } from './cache.interceptor';
// RedisModule is @Global() so RedisService is already available DI-wide.
// We still import it here for explicit module-to-module dependency clarity.
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
export class CacheModule { }
