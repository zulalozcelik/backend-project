import { SetMetadata } from '@nestjs/common';
import { CACHEABLE_TTL_META_KEY } from './cache.constants';
export function Cacheable(ttlSeconds: number) {
  return SetMetadata(CACHEABLE_TTL_META_KEY, ttlSeconds);
}
