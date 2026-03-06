export type TaskEntity = {
  id: string;
  title: string;
  description: string | null;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface ITaskRepository {
  create(data: { title: string; description?: string | undefined | null }): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
  findAll(): Promise<TaskEntity[]>;
  update(
    id: string,
    patch: Partial<Pick<TaskEntity, 'title' | 'description' | 'isDone'>>,
  ): Promise<TaskEntity | null>;
  softDelete(id: string): Promise<boolean>;
  hardDeleteSoftDeletedBefore(date: Date): Promise<number>;
}
