import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '../app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './common/configs/env';
import { DatabaseModule } from './core/database/database.module';
import { TestModule } from './modules/test/test.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './core/redis/redis.module';
import { MongoModule } from './core/mongo/mongo.module';
import { LoggingModule } from './common/logging/logging.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuditModule } from './modules/audit/audit.module';
import { EventsModule } from './common/events/events.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { DummyUserMiddleware } from './common/middleware/dummy-user.middleware';
import { QueueModule } from './queue/queue.module';
import { ReportModule } from './modules/report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      validate,
    }),
    LoggingModule,
    RedisModule,
    UserModule,
    DatabaseModule,
    TestModule,
    AuthModule,
    CacheModule,
    MongoModule,
    EventsModule,
    AuditModule,
    NotificationsModule,
    QueueModule,
    ReportModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, DummyUserMiddleware)
      .forRoutes('*');
  }
}
