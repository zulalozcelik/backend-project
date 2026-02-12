import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class DummyUserMiddleware implements NestMiddleware {
  use(req: Request & { user?: any }, _res: Response, next: NextFunction) {
    req.user = {
      id: 'demo-id',
      email: 'demo@test.com',
      role: 'user',
    };
    next();
  }
}
