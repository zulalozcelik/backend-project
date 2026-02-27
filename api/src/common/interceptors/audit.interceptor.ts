import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { JsonLoggerService } from '../logging/json-logger.service';
import { UserService } from '../../modules/user/user.service';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

type HttpRequest = {
    method: string;
    params: Record<string, string>;
    user?: { id?: string };
};

type ResponseBody = {
    id?: string;
    ID?: string;
    data?: { id?: string; ID?: string };
};

function controllerEntity(ctx: ExecutionContext): string | null {
    const p = Reflect.getMetadata(PATH_METADATA, ctx.getClass()) as unknown;
    if (typeof p !== 'string') return null;
    const parts = p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
}

function actionFromMethod(method: string): AuditAction | null {
    if (method === 'POST') return 'CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return null;
}

function idFrom(params: Record<string, string>, body: ResponseBody | null): string | null {
    if (params?.id) return params.id;
    const fromData = body?.data?.id ?? body?.data?.ID;
    if (fromData != null) return fromData;
    const direct = body?.id ?? body?.ID;
    if (direct != null) return direct;
    return null;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly auditService: AuditService,
        private readonly logger: JsonLoggerService,
        private readonly usersService: UserService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const req = context.switchToHttp().getRequest<HttpRequest>();
        const method = (req.method ?? '').toUpperCase();
        const action = actionFromMethod(method);
        if (!action) return next.handle();

        const entity = controllerEntity(context);
        const performedBy = req.user?.id ?? 'unknown';
        const preId = req.params?.id ?? null;

        let oldData: Record<string, unknown> | null = null;
        if (entity === 'users' && preId && (action === 'UPDATE' || action === 'DELETE')) {
            try {
                oldData = await this.usersService.findOneForAudit(preId);
            } catch {
                oldData = null;
            }
        }

        return next.handle().pipe(
            tap((body) => {
                const responseBody = body as ResponseBody | null;
                const entityId = idFrom(req.params, responseBody);
                if (!entity || !entityId) {
                    this.logger.warn('audit_skip_missing_key', 'AuditInterceptor', {
                        action,
                        entity,
                        entityId,
                        performedBy,
                    });
                    return;
                }

                const newData = (responseBody?.data ?? responseBody) as Record<string, unknown> | null;
                const payload = {
                    action,
                    entity,
                    entityId,
                    oldData: entity === 'users' ? oldData : null,
                    newData,
                    performedBy,
                    timestamp: new Date(),
                };

                void this.auditService.createLog(payload).catch((err: Error) => {
                    this.logger.error('audit_write_failed', 'AuditInterceptor', {
                        action,
                        entity,
                        entityId,
                        err: err.message,
                    });
                });

                this.logger.info('audit_write_fired', 'AuditInterceptor', {
                    action,
                    entity,
                    entityId,
                    performedBy,
                });
            }),
        );
    }
}
