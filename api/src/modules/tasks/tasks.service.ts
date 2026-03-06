import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ITaskRepository } from './repositories/task.repository';
import { TASK_REPOSITORY } from './repositories/task.repository';

@Injectable()
export class TasksService {
  constructor(@Inject(TASK_REPOSITORY) private readonly repo: ITaskRepository) {}

  create(title: string, description?: string) {
    return this.repo.create({ title, description });
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async update(id: string, patch: { title?: string; description?: string; isDone?: boolean }) {
    const t = await this.repo.update(id, patch);
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async remove(id: string) {
    const ok = await this.repo.softDelete(id);
    if (!ok) throw new NotFoundException('Task not found');
    return { deleted: true };
  }
}
