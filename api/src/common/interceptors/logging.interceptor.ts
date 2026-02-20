import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { JsonLoggerService } from '../logging/json-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: JsonLoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const req = context.switchToHttp().getRequest<any>();
        const res = context.switchToHttp().getResponse<any>();
        const start = Date.now();

        return next.handle().pipe(
            // Başarılı response
            tap(() => {
                const statusCode: number = res.statusCode ?? 200;
                const durationMs = Date.now() - start;
                const level = statusCode >= 400 ? 'warn' : 'info';

                this.logger[level]('http_request', 'LoggingInterceptor', {
                    requestId: req.requestId,
                    method: req.method,
                    path: req.url,
                    statusCode,
                    durationMs,
                });
            }),

            // Hata olan response — filter loglamadan önce burası da loglar
            catchError((err: unknown) => {
                const durationMs = Date.now() - start;
                const e = err as { name?: string; message?: string };

                this.logger.error('http_request_error', 'LoggingInterceptor', {
                    requestId: req.requestId,
                    method: req.method,
                    path: req.url,
                    durationMs,
                    errorName: e?.name,
                    errorMessage: e?.message,
                });

                return throwError(() => err);
            }),
        );
    }
}
