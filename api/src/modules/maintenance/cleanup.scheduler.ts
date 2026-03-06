import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { MAINTENANCE_QUEUE, CLEANUP_SOFT_DELETED_JOB } from './maintenance.jobs';
import { JsonLoggerService } from '../../common/logging/json-logger.service';

@Injectable()
export class CleanupScheduler {
  constructor(
    @InjectQueue(MAINTENANCE_QUEUE) private readonly queue: Queue,
    private readonly logger: JsonLoggerService,
  ) {}

  @Cron('0 0 3 * * *')
  async run() {
    await this.queue.add(CLEANUP_SOFT_DELETED_JOB, {}, { attempts: 3, removeOnComplete: true });
    this.logger.log(JSON.stringify({ msg: 'maintenance.cleanup.enqueued' }), CleanupScheduler.name);
  }
}
