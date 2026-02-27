// api/src/modules/cache/cacheable.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { CACHEABLE_TTL_META_KEY } from './cache.constants';

/**
 * Marks a GET handler as cacheable with the given TTL in seconds.
 * Usage: @Cacheable(60)
 *
 * Only works on GET endpoints that have a :id route param.
 * Cache key format: entity:id (e.g. users:abc123)
 */
export function Cacheable(ttlSeconds: number) {
    return SetMetadata(CACHEABLE_TTL_META_KEY, ttlSeconds);
}
