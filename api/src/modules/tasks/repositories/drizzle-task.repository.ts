import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, isNotNull, lt } from 'drizzle-orm';
import { tasks } from '../../../core/database/schema/tasks.table';

import type { ITaskRepository, TaskEntity } from './task.repository';

type DrizzleDb = ReturnType<
  typeof import('../../../core/database/drizzle.client').createDrizzleClient
>;

@Injectable()
export class DrizzleTaskRepository implements ITaskRepository {
  constructor(@Inject('DRIZZLE') private readonly db: DrizzleDb) {}

  async create(data: {
    title: string;
    description?: string | undefined | null;
  }): Promise<TaskEntity> {
    const [row] = await this.db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description ?? null,
        updatedAt: new Date(),
      })
      .returning();
    return row as TaskEntity;
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)));
    return (row as TaskEntity) ?? null;
  }

  async findAll(): Promise<TaskEntity[]> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(isNull(tasks.deletedAt))
      .orderBy(tasks.createdAt);
    return rows as TaskEntity[];
  }

  async update(
    id: string,
    patch: Partial<Pick<TaskEntity, 'title' | 'description' | 'isDone'>>,
  ): Promise<TaskEntity | null> {
    const [row] = await this.db
      .update(tasks)
      .set({
        ...patch,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();
    return (row as TaskEntity) ?? null;
  }

  async softDelete(id: string): Promise<boolean> {
    const rows = await this.db
      .update(tasks)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();
    return rows.length > 0;
  }

  async hardDeleteSoftDeletedBefore(date: Date): Promise<number> {
    const rows = await this.db
      .delete(tasks)
      .where(and(lt(tasks.deletedAt, date), isNotNull(tasks.deletedAt)))
      .returning();
    return rows.length;
  }
}
