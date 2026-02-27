import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../common/events/event-bus.service';
import { USER_CREATED_EVENT, UserCreatedEvent } from '../../domain/events/user-created.event';
import { JsonLoggerService } from '../../common/logging/json-logger.service';

@Injectable()
export class WelcomeEmailSubscriber implements OnModuleInit {
    constructor(
        private readonly eventBus: EventBusService,
        private readonly logger: JsonLoggerService,
    ) { }

    onModuleInit(): void {
        this.eventBus.on<UserCreatedEvent>(USER_CREATED_EVENT, (evt) => {
            void this.sendWelcome(evt).catch((err: Error) => {
                this.logger.error('welcome_email_failed', 'WelcomeEmailSubscriber', {
                    err: String(err),
                });
            });
        });
    }

    private async sendWelcome(evt: UserCreatedEvent): Promise<void> {
        this.logger.info('welcome_email_sent', 'WelcomeEmailSubscriber', {
            entityId: evt.entityId,
            performedBy: evt.performedBy,
        });
    }
}
