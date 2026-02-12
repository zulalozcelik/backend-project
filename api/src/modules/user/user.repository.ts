import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../../core/database/schema';
import { BaseRepository } from '../../core/database/base.repository';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { InferSelectModel } from 'drizzle-orm';

type User = InferSelectModel<typeof users>;

@Injectable()
export class UserRepository
  extends BaseRepository<User, CreateUserDto, UpdateUserDto> {

  constructor(@Inject('DRIZZLE') private readonly db: any) {
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

  async findAll(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));

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
}
