import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { InferSelectModel } from 'drizzle-orm';
import { users } from '../../core/database/schema';

export type JwtUser = InferSelectModel<typeof users>;

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { user?: JwtUser }>();
  return request.user;
});
