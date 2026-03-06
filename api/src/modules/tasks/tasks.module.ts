import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TASK_REPOSITORY } from './repositories/task.repository';
import { DrizzleTaskRepository } from './repositories/drizzle-task.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [TasksService, { provide: TASK_REPOSITORY, useClass: DrizzleTaskRepository }],
  exports: [TASK_REPOSITORY],
})
export class TasksModule {}
