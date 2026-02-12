import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UserModule } from './modules/user/user.module';
import { DummyUserMiddleware } from './common/middleware/dummy-user.middleware';
import type { MiddlewareConsumer } from '@nestjs/common';
import { validateEnv } from './common/configs/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    UserModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DummyUserMiddleware).forRoutes('*');
  }
}
