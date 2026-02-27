import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeEmailSubscriber } from './welcome-email.subscriber';
import { EventBusService } from '../../common/events/event-bus.service';
import { JsonLoggerService } from '../../common/logging/json-logger.service';
import { USER_CREATED_EVENT, UserCreatedEvent } from '../../domain/events/user-created.event';

const makeMockEventBus = () => {
    const listeners: Record<string, ((payload: unknown) => void)[]> = {};
    return {
        on: jest.fn((event: string, handler: (p: unknown) => void) => {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(handler);
        }),
        emit: jest.fn((event: string, payload: unknown) => {
            (listeners[event] ?? []).forEach((h) => h(payload));
        }),
        _listeners: listeners,
    };
};

const makeMockLogger = () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
});

describe('WelcomeEmailSubscriber', () => {
    let subscriber: WelcomeEmailSubscriber;
    let eventBus: ReturnType<typeof makeMockEventBus>;
    let logger: ReturnType<typeof makeMockLogger>;

    beforeEach(async () => {
        eventBus = makeMockEventBus();
        logger = makeMockLogger();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WelcomeEmailSubscriber,
                { provide: EventBusService, useValue: eventBus },
                { provide: JsonLoggerService, useValue: logger },
            ],
        }).compile();

        subscriber = module.get<WelcomeEmailSubscriber>(WelcomeEmailSubscriber);
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(subscriber).toBeDefined();
    });

    it('should register listener on USER_CREATED_EVENT during onModuleInit', () => {
        subscriber.onModuleInit();
        expect(eventBus.on).toHaveBeenCalledWith(USER_CREATED_EVENT, expect.any(Function));
    });

    it('should log welcome_email_sent when USER_CREATED_EVENT fires', async () => {
        subscriber.onModuleInit();

        const evt: UserCreatedEvent = {
            entity: 'users',
            entityId: 'abc-123',
            newData: { name: 'Alice' },
            performedBy: 'system',
            timestamp: new Date().toISOString(),
        };

        eventBus.emit(USER_CREATED_EVENT, evt);
        await new Promise((r) => setTimeout(r, 10));

        expect(logger.info).toHaveBeenCalledWith(
            'welcome_email_sent',
            'WelcomeEmailSubscriber',
            expect.objectContaining({ entityId: 'abc-123' }),
        );
    });
});
