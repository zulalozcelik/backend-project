import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    get(key: string): Promise<string | null> {
        return this.redis.get(key);
    }

    set(key: string, value: string, opts?: { exSeconds?: number }): Promise<'OK'> {
        if (opts?.exSeconds) {
            return this.redis.set(key, value, 'EX', opts.exSeconds);
        }
        return this.redis.set(key, value);
    }

    incr(key: string): Promise<number> {
        return this.redis.incr(key);
    }

    expire(key: string, seconds: number): Promise<number> {
        return this.redis.expire(key, seconds);
    }

    ttl(key: string): Promise<number> {
        return this.redis.ttl(key);
    }

    async eval<T = unknown>(
        script: string,
        keys: string[],
        args: (string | number)[],
    ): Promise<T> {
        const result = await this.redis.eval(
            script,
            keys.length,
            ...keys,
            ...args.map(String),
        );
        return result as T;
    }

    async onModuleDestroy() {
        try {
            await this.redis.quit();
        } catch {
            this.redis.disconnect();
        }
    }
}
