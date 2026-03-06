import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [TestController],
})
export class TestModule {}
