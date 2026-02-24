import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodError } from 'zod';
import { BaseAppException } from '../exceptions/base-app.exception';
import { JsonLoggerService } from '../logging/json-logger.service';

type ErrorResponse = {
    statusCode: number;
    error: string;
    message: string;
    timestamp: string;
    path: string;
    requestId?: string;
    details?: unknown;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: JsonLoggerService,
    ) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<any>();
        const res = ctx.getResponse<any>();

        const path = req?.url ?? 'unknown';
        const requestId = req?.requestId;
        const timestamp = new Date().toISOString();
        const isProduction = process.env.NODE_ENV === 'production';

        const normalized = this.normalizeException(exception);
        const level = normalized.statusCode >= 500 ? 'error' : 'warn';

        this.logger[level]('http_exception', 'GlobalExceptionFilter', {
            requestId,
            path,
            statusCode: normalized.statusCode,
            error: normalized.error,
            message: normalized.message,
            ...(normalized.details ? { details: normalized.details } : {}),
            ...(!isProduction && normalized.stack ? { stack: normalized.stack } : {}),
        });

        const body: ErrorResponse = {
            statusCode: normalized.statusCode,
            error: normalized.error,
            message: normalized.message,
            timestamp,
            path,
            ...(requestId ? { requestId } : {}),
            ...(normalized.details ? { details: normalized.details } : {}),
        };

        httpAdapter.reply(res, body, normalized.statusCode);
    }

    private normalizeException(exception: unknown): {
        error: string;
        message: string;
        statusCode: number;
        stack?: string;
        details?: unknown;
    } {
        // 1) ZodValidationException (nestjs-zod pipe)
        if (exception instanceof Error && exception.name === 'ZodValidationException') {
            const resBody =
                typeof (exception as any).getResponse === 'function'
                    ? (exception as any).getResponse()
                    : undefined;

            const issues =
                (resBody as any)?.issues ??
                (resBody as any)?.errors ??
                (exception as any)?.zodError?.issues ??
                [];

            const details = Array.isArray(issues)
                ? issues.map((i: any) => ({
                    field: Array.isArray(i.path) ? i.path.join('.') : i.path ?? '',
                    message: i.message ?? 'Invalid value',
                    code: i.code ?? 'invalid',
                }))
                : [];

            return {
                error: 'VALIDATION_ERROR',
                message: 'Validation failed',
                statusCode: HttpStatus.BAD_REQUEST,
                stack: exception.stack,
                ...(details.length ? { details } : {}),
            };
        }

        // 2) Direct ZodError
        if (exception instanceof ZodError) {
            const details = exception.issues.map((i) => ({
                field: i.path.join('.'),
                message: i.message,
                code: i.code,
            }));

            return {
                error: 'VALIDATION_ERROR',
                message: 'Validation failed',
                statusCode: HttpStatus.BAD_REQUEST,
                stack: exception.stack,
                details,
            };
        }

        // 3) Our custom exceptions (AuthorizationError, AuthenticationError etc.)
        if (exception instanceof BaseAppException) {
            return {
                error: exception.type,
                message: exception.message,
                statusCode: exception.statusCode,
                stack: exception.stack,
                ...(exception.details ? { details: exception.details } : {}),
            };
        }

        // 4) NestJS built-in HttpException
        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();
            const response = exception.getResponse();
            const msg =
                typeof response === 'string'
                    ? response
                    : (response as any)?.message ?? exception.message;

            return {
                error: exception.name,
                message: Array.isArray(msg) ? msg.join(', ') : msg,
                statusCode,
                stack: exception.stack,
            };
        }

        // 5) Unknown error
        const e = exception as Error | undefined;
        return {
            error: e?.name ?? 'INTERNAL_SERVER_ERROR',
            message: e?.message ?? 'Internal server error',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            stack: e?.stack,
        };
    }
}
