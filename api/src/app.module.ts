import { Module } from '@nestjs/common';
import { AppController } from '../app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UserModule } from './modules/user/user.module';
import { DummyUserMiddleware } from './common/middleware/dummy-user.middleware';
import { MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './common/configs/env';
import { DatabaseModule } from './core/database/database.module';
import { TestModule } from './modules/test/test.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      validate,
    }),
    UserModule,
    DatabaseModule,
    TestModule,
    AuthModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DummyUserMiddleware).forRoutes('*');
  }
}
