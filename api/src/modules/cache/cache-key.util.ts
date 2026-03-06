import { PATH_METADATA } from '@nestjs/common/constants';
import type { ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

type Maybe<T> = T | undefined | null;

interface RequestWithParams {
  params?: Record<string, string | undefined>;
}

interface ResponseWithIds {
  id?: string;
  ID?: string;
  data?: { id?: string; ID?: string };
}

function normalizeControllerPath(path: unknown): string | null {
  if (typeof path !== 'string') return null;
  const cleaned = path.replace(/^\/+|\/+$/g, '');
  if (!cleaned) return null;
  const segments = cleaned.split('/');
  return segments[segments.length - 1] ?? null;
}

function getControllerEntity(ctx: ExecutionContext): string | null {
  const controllerPath: Maybe<string> = Reflect.getMetadata(PATH_METADATA, ctx.getClass()) as
    | string
    | undefined
    | null;
  return normalizeControllerPath(controllerPath);
}

function getIdFromParams(req: RequestWithParams): string | null {
  const id = req?.params?.id;
  if (id === undefined || id === null) return null;
  return String(id);
}

export function buildEntityIdCacheKey(ctx: ExecutionContext): string | null {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const entity = getControllerEntity(ctx);
  const id = getIdFromParams(req as RequestWithParams);

  if (!entity || !id) return null;
  return `${entity}:${id}`;
}

export function resolveEntity(ctx: ExecutionContext): string | null {
  return getControllerEntity(ctx);
}

export function resolveId(
  req: RequestWithParams,
  responseBody: ResponseWithIds | null,
): string | null {
  const paramId = getIdFromParams(req);
  if (paramId) return paramId;

  const fromData = responseBody?.data?.id ?? responseBody?.data?.ID;
  if (fromData !== undefined && fromData !== null) return String(fromData);

  const direct = responseBody?.id ?? responseBody?.ID;
  if (direct !== undefined && direct !== null) return String(direct);

  return null;
}
