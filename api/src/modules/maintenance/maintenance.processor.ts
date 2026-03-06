import { Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { MAINTENANCE_QUEUE, CLEANUP_SOFT_DELETED_JOB } from './maintenance.jobs';
import { TASK_REPOSITORY } from '../tasks/repositories/task.repository';
import type { ITaskRepository } from '../tasks/repositories/task.repository';
import { JsonLoggerService } from '../../common/logging/json-logger.service';

@Processor(MAINTENANCE_QUEUE)
export class MaintenanceProcessor extends WorkerHost {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly tasksRepo: ITaskRepository,
    private readonly logger: JsonLoggerService,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    if (job.name === CLEANUP_SOFT_DELETED_JOB) {
      const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedCount = await this.tasksRepo.hardDeleteSoftDeletedBefore(threshold);
      this.logger.log(
        JSON.stringify({
          msg: 'maintenance.cleanup.done',
          deletedCount,
          threshold: threshold.toISOString(),
        }),
        MaintenanceProcessor.name,
      );
      return { deletedCount };
    }

    return null;
  }
}
