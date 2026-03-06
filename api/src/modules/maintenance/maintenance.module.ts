import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MAINTENANCE_QUEUE } from './maintenance.jobs';
import { CleanupScheduler } from './cleanup.scheduler';
import { HealthScheduler } from './health.scheduler';
import { MaintenanceProcessor } from './maintenance.processor';
import { TasksModule } from '../tasks/tasks.module';
import { LoggingModule } from '../../common/logging/logging.module';

@Module({
  imports: [BullModule.registerQueue({ name: MAINTENANCE_QUEUE }), TasksModule, LoggingModule],
  providers: [CleanupScheduler, HealthScheduler, MaintenanceProcessor],
})
export class MaintenanceModule {}
