// api/src/modules/cache/cache-key.util.ts
import { PATH_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';

type Maybe<T> = T | undefined | null;

/**
 * Normalise controller path → single entity segment.
 *
 * Rules:
 *  - Strip leading/trailing slashes
 *  - Take LAST segment so that "api/users" → "users" (not "api")
 *    (commonly the last segment is the resource name)
 *
 * Examples:
 *   "users"       → "users"
 *   "api/users"   → "users"
 *   "/users/"     → "users"
 *   ""            → null
 */
function normalizeControllerPath(path: unknown): string | null {
    if (typeof path !== 'string') return null;
    const cleaned = path.replace(/^\/+|\/+$/g, '');
    if (!cleaned) return null;
    const segments = cleaned.split('/');
    // Use the LAST segment → "api/users" gives "users"
    return segments[segments.length - 1] ?? null;
}

function getControllerEntity(ctx: ExecutionContext): string | null {
    const controllerPath: Maybe<string> = Reflect.getMetadata(
        PATH_METADATA,
        ctx.getClass(),
    );
    return normalizeControllerPath(controllerPath);
}

function getIdFromParams(req: any): string | null {
    const id = req?.params?.id;
    if (id === undefined || id === null) return null;
    return String(id);
}

/**
 * Builds a Redis cache key: "entity:id"
 * Returns null if either part cannot be resolved.
 */
export function buildEntityIdCacheKey(ctx: ExecutionContext): string | null {
    const req = ctx.switchToHttp().getRequest();
    const entity = getControllerEntity(ctx);
    const id = getIdFromParams(req);

    if (!entity || !id) return null;
    return `${entity}:${id}`;
}

/** Returns only the entity name (last segment of controller path). */
export function resolveEntity(ctx: ExecutionContext): string | null {
    return getControllerEntity(ctx);
}

/**
 * Resolves the id for cache invalidation.
 * Priority: req.params.id → responseBody.data.id → responseBody.id
 */
export function resolveId(req: any, responseBody: any): string | null {
    // 1) route param
    const paramId = getIdFromParams(req);
    if (paramId) return paramId;

    // 2) response body: { data: { id } }
    const fromData = responseBody?.data?.id ?? responseBody?.data?.ID;
    if (fromData !== undefined && fromData !== null) return String(fromData);

    // 3) response body: { id }
    const direct = responseBody?.id ?? responseBody?.ID;
    if (direct !== undefined && direct !== null) return String(direct);

    return null;
}
