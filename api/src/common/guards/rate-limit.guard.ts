import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';
import { RedisService } from '../../core/redis/redis.service';
import { JsonLoggerService } from '../logging/json-logger.service';

type Req = {
    url: string;
    method: string;
    ip?: string;
    requestId?: string;
    user?: { id?: string };
};

type Res = {
    header: (name: string, value: string) => void;
};

const SLIDING_WINDOW_LUA = `
local nowMs      = tonumber(ARGV[1])
local windowSec  = tonumber(ARGV[2])
local limit      = tonumber(ARGV[3])
local windowMs   = windowSec * 1000

local currentStart = math.floor(nowMs / windowMs) * windowMs

local current = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], windowSec * 2)

local prev = tonumber(redis.call('GET', KEYS[2])) or 0
local elapsed = nowMs - currentStart
local weight  = math.max(0, math.min(1, (windowMs - elapsed) / windowMs))
local estimated = prev * weight + current

if estimated > limit then
  local retryAfter = math.ceil((windowMs - elapsed) / 1000)
  if retryAfter < 1 then retryAfter = 1 end
  return {0, retryAfter}
end

return {1, 0}
`;

@Injectable()
export class RateLimitGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly redis: RedisService,
        private readonly logger: JsonLoggerService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const options = this.reflector.getAllAndOverride<RateLimitOptions>(
            RATE_LIMIT_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!options) return true;

        const req = context.switchToHttp().getRequest<Req>();
        const res = context.switchToHttp().getResponse<Res>();

        const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip ?? 'unknown'}`;
        const routeKey = `${req.method}:${req.url}`;
        const baseKey = `rl:${routeKey}:${identifier}`;

        const nowMs = Date.now();
        const windowMs = options.window * 1000;
        const currentStart = Math.floor(nowMs / windowMs) * windowMs;

        const result = await this.redis.eval<number[]>(
            SLIDING_WINDOW_LUA,
            [`${baseKey}:${currentStart}`, `${baseKey}:${currentStart - windowMs}`],
            [nowMs, options.window, options.limit],
        );

        const allowed = result[0] === 1;
        const retryAfter = Number(result[1] ?? 0);

        if (!allowed) {
            res.header('Retry-After', String(retryAfter));

            this.logger.warn('rate_limited', 'RateLimitGuard', {
                requestId: req.requestId,
                method: req.method,
                path: req.url,
                identifier,
                limit: options.limit,
                windowSec: options.window,
                retryAfterSec: retryAfter,
            });

            throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
        }

        return true;
    }
}
