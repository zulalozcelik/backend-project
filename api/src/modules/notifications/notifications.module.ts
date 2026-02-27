import { Module } from '@nestjs/common';
import { WelcomeEmailSubscriber } from './welcome-email.subscriber';
import { EventsModule } from '../../common/events/events.module';
import { LoggingModule } from '../../common/logging/logging.module';

@Module({
    imports: [EventsModule, LoggingModule],
    providers: [WelcomeEmailSubscriber],
})
export class NotificationsModule { }
