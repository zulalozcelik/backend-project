import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const id = randomUUID();

        // request.requestId olarak sakla — interceptor + filter buradan okuyacak
        req.requestId = id;

        // response header'ına yaz — client tarafında tracing için
        res.header('x-request-id', id);

        next();
    }
}
