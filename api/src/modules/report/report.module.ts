import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReportProcessor } from './report.processor';
import { REPORT_GENERATION_QUEUE, DEAD_LETTER_QUEUE } from '../../queue/queue.constants';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { LoggingModule } from '../../common/logging/logging.module';

@Module({
    imports: [
        LoggingModule,
        BullModule.registerQueue(
            { name: REPORT_GENERATION_QUEUE },
            { name: DEAD_LETTER_QUEUE },
        ),
    ],
    controllers: [ReportController],
    providers: [ReportService, ReportProcessor, RateLimitGuard],
})
export class ReportModule { }
