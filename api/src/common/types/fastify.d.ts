import type { Role } from '../auth/roles.js';

declare module 'fastify' {
  interface FastifyRequest {
    requestId?: string;
    user?: {
      id: string;
      sub: string;
      role?: Role;
    };
  }
}
