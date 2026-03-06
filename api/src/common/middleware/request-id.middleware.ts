import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: IncomingMessage & { requestId?: string }, res: ServerResponse, next: () => void) {
    const id = randomUUID();

    // request.requestId olarak sakla — interceptor + filter buradan okuyacak
    req.requestId = id;

    // response header'ına yaz — client tarafında tracing için
    res.setHeader('x-request-id', id);

    next();
  }
}
