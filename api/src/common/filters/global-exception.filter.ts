import {
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodError } from 'zod';

import { BaseAppException } from '../exceptions/base-app.exception';

type ErrorResponse = {
    type: string;
    error: string;
    message: string;
    timestamp: string;
    path: string;
    statusCode: number;
    stack?: string;
    details?: Record<string, unknown> | Record<string, unknown>[];
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: import('@nestjs/common').ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const path =
            typeof httpAdapter.getRequestUrl === 'function'
                ? httpAdapter.getRequestUrl(request)
                : request?.url ?? 'unknown';

        const timestamp = new Date().toISOString();
        const isProduction = process.env.NODE_ENV === 'production';

        const normalized = this.normalizeException(exception);

        const body: ErrorResponse = {
            type: normalized.type,
            error: normalized.error,
            message: normalized.message,
            timestamp,
            path,
            statusCode: normalized.statusCode,
            ...(normalized.details ? { details: normalized.details } : {}),
            ...(!isProduction && normalized.stack ? { stack: normalized.stack } : {}),
        };

        // ✅ Log all errors
        this.logger.error(
            `${normalized.statusCode} ${path} - ${normalized.error}: ${normalized.message}`,
            normalized.stack,
        );

        // ✅ Works for Fastify + Express
        httpAdapter.reply(response, body, normalized.statusCode);
    }

    private normalizeException(exception: unknown): {
        type: string;
        error: string;
        message: string;
        statusCode: number;
        stack?: string;
        details?: Record<string, unknown> | Record<string, unknown>[];
    } {
        // 0) nestjs-zod: ZodValidationException → VALIDATION_ERROR
        if (
            exception instanceof Error &&
            exception.name === 'ZodValidationException'
        ) {
            const resBody =
                typeof (exception as any).getResponse === 'function'
                    ? (exception as any).getResponse()
                    : undefined;

            const issues =
                (resBody as any)?.issues ??
                (resBody as any)?.errors ??
                (exception as any)?.issues ??
                (exception as any)?.zodError?.issues ??
                [];

            const details = Array.isArray(issues)
                ? issues.map((issue: any) => ({
                    field: Array.isArray(issue.path)
                        ? issue.path.join('.')
                        : issue.path ?? '',
                    message: issue.message ?? 'Invalid value',
                    code: issue.code ?? 'invalid',
                }))
                : [];

            return {
                type: 'VALIDATION_ERROR',
                error: 'ZodValidationException',
                message: 'Validation failed',
                statusCode: HttpStatus.BAD_REQUEST,
                stack: exception.stack,
                ...(details.length ? { details } : {}),
            };
        }

        // 1) Zod validation hatalari (direkt ZodError gelirse)
        if (exception instanceof ZodError) {
            const details = exception.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code,
            }));

            return {
                type: 'VALIDATION_ERROR',
                error: 'ZodError',
                message: 'Validation failed',
                statusCode: HttpStatus.BAD_REQUEST,
                stack: exception.stack,
                details,
            };
        }

        // 2) Bizim custom exception'larimiz
        if (exception instanceof BaseAppException) {
            return {
                type: exception.type,
                error: exception.error,
                message: exception.message,
                statusCode: exception.statusCode,
                stack: exception.stack,
                ...(exception.details ? { details: exception.details } : {}),
            };
        }

        // 3) Nest HttpException (ValidationPipe vs.)
        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();
            const response = exception.getResponse();

            const message =
                typeof response === 'string'
                    ? response
                    : (response as { message?: unknown }).message;

            return {
                type: 'HTTP_EXCEPTION',
                error: exception.name,
                message:
                    typeof message === 'string'
                        ? message
                        : Array.isArray(message)
                            ? message.join(', ')
                            : exception.message,
                statusCode,
                stack: exception.stack,
            };
        }

        // 4) Unknown
        if (exception instanceof Error) {
            return {
                type: 'INTERNAL_SERVER_ERROR',
                error: exception.name,
                message: exception.message || 'Unexpected error',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                stack: exception.stack,
            };
        }

        return {
            type: 'INTERNAL_SERVER_ERROR',
            error: 'UnknownError',
            message: 'Unexpected error',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
}
