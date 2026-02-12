import { IGenericRepository } from './generic.repository.interface';
import { eq, isNull } from 'drizzle-orm';

export abstract class BaseRepository<T> implements IGenericRepository<T> {
  protected constructor(
    protected readonly db: any,
    protected readonly table: any,
  ) {}

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db.insert(this.table).values(data).returning();

    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const [result] = await this.db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning();

    return result;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }

  async findById(id: string): Promise<T | null> {
    const [result] = await this.db.select().from(this.table).where(eq(this.table.id, id));

    return result ?? null;
  }

  async findAll(skip = 0, limit = 10): Promise<T[]> {
    return this.db
      .select()
      .from(this.table)
      .where(isNull(this.table.deletedAt))
      .limit(limit)
      .offset(skip);
  }

  async softDelete(id: string): Promise<void> {
    await this.db.update(this.table).set({ deletedAt: new Date() }).where(eq(this.table.id, id));
  }

  async restore(id: string): Promise<void> {
    await this.db.update(this.table).set({ deletedAt: null }).where(eq(this.table.id, id));
  }
}
