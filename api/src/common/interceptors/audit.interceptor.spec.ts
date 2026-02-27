import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from '../../modules/audit/audit.service';
import { JsonLoggerService } from '../logging/json-logger.service';
import { UserService } from '../../modules/user/user.service';

const makeMockAuditService = () => ({
    createLog: jest.fn().mockResolvedValue(undefined),
});

const makeMockLogger = () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
});

const makeMockUserService = () => ({
    findOneForAudit: jest.fn().mockResolvedValue({ id: 'user-1', name: 'Alice' }),
});

function makeContext(
    method: string,
    entity: string,
    params: Record<string, string> = {},
    user?: { id?: string },
): ExecutionContext {
    const mockClass = class { };
    Reflect.defineMetadata('path', entity, mockClass);

    return {
        getClass: jest.fn().mockReturnValue(mockClass),
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({ method, params, user }),
        }),
    } as unknown as ExecutionContext;
}

describe('AuditInterceptor', () => {
    let interceptor: AuditInterceptor;
    let auditService: ReturnType<typeof makeMockAuditService>;
    let logger: ReturnType<typeof makeMockLogger>;
    let userService: ReturnType<typeof makeMockUserService>;

    beforeEach(async () => {
        auditService = makeMockAuditService();
        logger = makeMockLogger();
        userService = makeMockUserService();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuditInterceptor,
                { provide: AuditService, useValue: auditService },
                { provide: JsonLoggerService, useValue: logger },
                { provide: UserService, useValue: userService },
            ],
        }).compile();

        interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(interceptor).toBeDefined();
    });

    it('should skip audit for GET requests', async () => {
        const ctx = makeContext('GET', 'users');
        const next: CallHandler = { handle: jest.fn().mockReturnValue(of({ id: '1' })) };

        const obs = await interceptor.intercept(ctx, next);
        await new Promise<void>((resolve) => obs.subscribe({ complete: resolve }));

        expect(auditService.createLog).not.toHaveBeenCalled();
    });

    it('should fire audit log for POST request', async () => {
        const ctx = makeContext('POST', 'users', {}, { id: 'usr-id' });
        const responseBody = { id: 'new-user-id', name: 'Bob' };
        const next: CallHandler = { handle: jest.fn().mockReturnValue(of(responseBody)) };

        const obs = await interceptor.intercept(ctx, next);
        await new Promise<void>((resolve) => obs.subscribe({ complete: resolve }));
        await new Promise((r) => setTimeout(r, 10));

        expect(auditService.createLog).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'CREATE', entityId: 'new-user-id' }),
        );
    });

    it('should fetch oldData for PATCH on users entity', async () => {
        const ctx = makeContext('PATCH', 'users', { id: 'user-1' }, { id: 'admin-id' });
        const responseBody = { id: 'user-1', name: 'Updated' };
        const next: CallHandler = { handle: jest.fn().mockReturnValue(of(responseBody)) };

        const obs = await interceptor.intercept(ctx, next);
        await new Promise<void>((resolve) => obs.subscribe({ complete: resolve }));
        await new Promise((r) => setTimeout(r, 10));

        expect(userService.findOneForAudit).toHaveBeenCalledWith('user-1');
        expect(auditService.createLog).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'UPDATE', oldData: expect.any(Object) }),
        );
    });

    it('should warn and skip if entityId cannot be resolved', async () => {
        const ctx = makeContext('POST', 'users', {}, { id: 'usr-id' });
        const next: CallHandler = { handle: jest.fn().mockReturnValue(of({ something: 'else' })) };

        const obs = await interceptor.intercept(ctx, next);
        await new Promise<void>((resolve) => obs.subscribe({ complete: resolve }));
        await new Promise((r) => setTimeout(r, 10));

        expect(auditService.createLog).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
            'audit_skip_missing_key',
            'AuditInterceptor',
            expect.any(Object),
        );
    });
});
