import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const url = config.get<string>('REDIS_URL');
                if (!url) throw new Error('REDIS_URL is missing');

                return new Redis(url, {
                    maxRetriesPerRequest: 3,
                    enableReadyCheck: true,
                    lazyConnect: false,
                });
            },
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
