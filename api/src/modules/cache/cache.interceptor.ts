// api/src/modules/cache/cache.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CACHEABLE_TTL_META_KEY } from './cache.constants';
import {
    buildEntityIdCacheKey,
    resolveEntity,
    resolveId,
} from './cache-key.util';
import { RedisService } from '../../core/redis/redis.service';
import { JsonLoggerService } from '../../common/logging/json-logger.service';

// ─── Local Types ─────────────────────────────────────────────────────────────

type SuccessResponse<T = unknown> = {
    data: T;
    meta?: Record<string, unknown>;
};

type CachedEnvelope<T = unknown> = {
    data: T;
    cachedAt: string;
    ttl: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureEnvelope<T>(body: any): SuccessResponse<T> {
    if (body !== null && typeof body === 'object' && 'data' in body) {
        return body as SuccessResponse<T>;
    }
    return { data: body as T };
}

function withMeta<T>(
    resp: SuccessResponse<T>,
    patch: Record<string, unknown>,
): SuccessResponse<T> {
    return {
        ...resp,
        meta: { ...(resp.meta ?? {}), ...patch },
    };
}

// ─── Interceptor ─────────────────────────────────────────────────────────────

const CTX = 'CacheInterceptor';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly redisService: RedisService,
        private readonly logger: JsonLoggerService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<any>();
        const method = String(req?.method ?? '').toUpperCase();

        const ttlSeconds = this.reflector.get<number | undefined>(
            CACHEABLE_TTL_META_KEY,
            context.getHandler(),
        );

        const isRead = method === 'GET';
        const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

        // ── READ PATH ────────────────────────────────────────────────────────────
        if (isRead && typeof ttlSeconds === 'number' && ttlSeconds > 0) {
            const key = buildEntityIdCacheKey(context);

            this.logger.info('cache_read_attempt', CTX, {
                method,
                url: req.url,
                key,
                ttlSeconds,
            });

            if (!key) {
                this.logger.warn('cache_key_not_built', CTX, { url: req.url });
                return next.handle().pipe(
                    map((body) => withMeta(ensureEnvelope(body), { isCached: false })),
                );
            }

            return of(null).pipe(
                switchMap(() => this.redisService.get(key)),
                switchMap((cachedRaw) => {
                    // ── HIT ────────────────────────────────────────────────────────
                    if (cachedRaw) {
                        let parsed: CachedEnvelope | null = null;
                        try {
                            parsed = JSON.parse(cachedRaw) as CachedEnvelope;
                        } catch {
                            parsed = null;
                            this.logger.warn('cache_parse_error', CTX, { key });
                        }

                        if (parsed !== null && typeof parsed === 'object' && 'data' in parsed) {
                            this.logger.info('cache_hit', CTX, {
                                key,
                                cachedAt: parsed.cachedAt,
                                ttl: parsed.ttl,
                            });
                            const resp: SuccessResponse = { data: parsed.data };
                            return of(
                                withMeta(resp, {
                                    isCached: true,
                                    cachedAt: parsed.cachedAt,
                                    ttl: parsed.ttl,
                                }),
                            );
                        }
                    }

                    // ── MISS ────────────────────────────────────────────────────────
                    this.logger.info('cache_miss', CTX, { key });
                    return next.handle().pipe(
                        switchMap(async (body) => {
                            const resp = ensureEnvelope(body);
                            const cachedAt = new Date().toISOString();
                            const envelope: CachedEnvelope = { data: resp.data, cachedAt, ttl: ttlSeconds };

                            await this.redisService.set(
                                key,
                                JSON.stringify(envelope),
                                { exSeconds: ttlSeconds },
                            );

                            this.logger.info('cache_write', CTX, { key, ttlSeconds, cachedAt });
                            return withMeta(resp, { isCached: false });
                        }),
                    );
                }),
            );
        }

        // ── WRITE PATH ───────────────────────────────────────────────────────────
        if (isWrite) {
            return next.handle().pipe(
                tap(async (body) => {
                    const entity = resolveEntity(context);
                    if (!entity) return;

                    const id = resolveId(req, body);
                    if (!id) {
                        this.logger.warn('cache_invalidate_no_id', CTX, { entity, url: req.url });
                        return;
                    }

                    const key = `${entity}:${id}`;
                    await this.redisService.del(key);
                    this.logger.info('cache_invalidated', CTX, { key });
                }),
                map((body) => withMeta(ensureEnvelope(body), { isCached: false })),
            );
        }

        // ── OTHER ────────────────────────────────────────────────────────────────
        return next.handle().pipe(
            map((body) => withMeta(ensureEnvelope(body), { isCached: false })),
        );
    }
}
