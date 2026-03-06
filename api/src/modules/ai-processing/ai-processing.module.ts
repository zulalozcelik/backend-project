import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiProcessingController } from './ai-processing.controller';
import { AiProcessingService } from './ai-processing.service';
import { AiProcessingWorker } from './ai-processing.worker';
import { AiModule } from '../../core/ai/ai.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { AI_PROCESSING_QUEUE } from './ai-processing.constants';

@Module({
  imports: [BullModule.registerQueue({ name: AI_PROCESSING_QUEUE }), AiModule, RealtimeModule],
  controllers: [AiProcessingController],
  providers: [AiProcessingService, AiProcessingWorker],
})
export class AiProcessingModule {}
