import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../../core/database/schema';
import { BaseRepository } from '../../core/database/base.repository';
import type { PaginationParams } from '../../core/database/generic.repository.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { InferSelectModel } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../core/database/schema';

type User = InferSelectModel<typeof users>;

@Injectable()
export class UserRepository extends BaseRepository<User, CreateUserDto, UpdateUserDto> {
  constructor(@Inject('DRIZZLE') private readonly db: PostgresJsDatabase<typeof schema>) {
    super();
  }

  async create(data: CreateUserDto): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
      })
      .returning();

    return user;
  }

  async findAll(params?: PaginationParams): Promise<User[]> {
    const query = this.db.select().from(users);

    if (params?.limit) {
      query.limit(params.limit);
    }

    if (params?.skip) {
      query.offset(params.skip);
    }

    return query;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));

    return user ?? null;
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async restore(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        deletedAt: null,
      })
      .where(eq(users.id, id));
  }

  async withTransaction<R>(fn: (tx: PostgresJsDatabase<typeof schema>) => Promise<R>): Promise<R> {
    return this.db.transaction(async (tx) => {
      return fn(tx);
    });
  }
}
