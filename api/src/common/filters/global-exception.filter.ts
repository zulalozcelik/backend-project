import {
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import { BaseAppException } from '../exceptions/base-app.exception';

type StandardErrorResponse = {
    type: string;
    error: string;
    message: string;
    timestamp: string;
    path: string;
    statusCode: number;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        const timestamp = new Date().toISOString();
        const path = req.originalUrl ?? req.url;
        const isProd = process.env.NODE_ENV === 'production';

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let type = 'INTERNAL_SERVER_ERROR';
        let message = 'Unexpected error';

        // error alanı "hata kodu/etiketi" gibi dursun:
        // custom exception -> class adı
        // http exception -> HTTP_EXCEPTION
        // unknown -> INTERNAL_ERROR
        let error = 'INTERNAL_ERROR';

        if (exception instanceof BaseAppException) {
            statusCode = exception.statusCode;
            type = exception.type;
            message = exception.message;
            error = exception.constructor.name;

            this.logger.error(
                `[${statusCode}] ${req.method} ${path} - ${type}: ${message}`,
                isProd ? undefined : (exception as Error).stack,
            );

            if (exception.details) {
                this.logger.error(`Details: ${JSON.stringify(exception.details)}`);
            }
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            type = 'HTTP_EXCEPTION';
            error = 'HTTP_EXCEPTION';

            const response = exception.getResponse();
            if (typeof response === 'string') {
                message = response;
            } else if (typeof response === 'object' && response !== null) {
                const msg = (response as Record<string, unknown>)['message'];
                message =
                    typeof msg === 'string'
                        ? msg
                        : Array.isArray(msg)
                            ? msg.join(', ')
                            : exception.message;
            } else {
                message = exception.message;
            }

            this.logger.error(
                `[${statusCode}] ${req.method} ${path} - ${message}`,
                isProd ? undefined : exception.stack,
            );
        } else if (exception instanceof Error) {
            message = exception.message || message;
            error = exception.name || 'ERROR';

            this.logger.error(
                `[${statusCode}] ${req.method} ${path} - ${message}`,
                isProd ? undefined : exception.stack,
            );
        } else {
            this.logger.error(
                `[${statusCode}] ${req.method} ${path} - ${message}`,
            );
        }

        const payload: StandardErrorResponse = {
            type,
            error,
            message,
            timestamp,
            path,
            statusCode,
        };

        res.status(statusCode).json(payload);
    }
}
