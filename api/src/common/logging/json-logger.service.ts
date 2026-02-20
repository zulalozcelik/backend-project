import { Injectable, LoggerService } from '@nestjs/common';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable()
export class JsonLoggerService implements LoggerService {
    private write(
        level: LogLevel,
        message: string,
        context?: string,
        meta?: Record<string, unknown>,
    ) {
        console.log(
            JSON.stringify({
                level,
                timestamp: new Date().toISOString(),
                message,
                ...(context ? { context } : {}),
                ...(meta ? { meta } : {}),
            }),
        );
    }

    debug(message: string, context?: string) {
        this.write('debug', message, context);
    }

    log(message: string, context?: string) {
        this.write('info', message, context);
    }

    info(message: string, context?: string, meta?: Record<string, unknown>) {
        this.write('info', message, context, meta);
    }

    warn(message: string, context?: string, meta?: Record<string, unknown>) {
        this.write('warn', message, context, meta);
    }

    error(message: string, context?: string, meta?: Record<string, unknown>) {
        this.write('error', message, context, meta);
    }
}
