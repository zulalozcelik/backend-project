import { Inject, Injectable } from '@nestjs/common';
import { BaseRepository } from '@/core/database/base.repository';
import { users } from '@/core/database/schema';
import { IGenericRepository } from '@/core/database/generic.repository.interface';

type User = typeof users.$inferSelect;
type CreateUserDto = typeof users.$inferInsert;
type UpdateUserDto = Partial<typeof users.$inferInsert>;

export interface IUserRepository extends IGenericRepository<User, CreateUserDto, UpdateUserDto> {}

@Injectable()
export class UserRepository
  extends BaseRepository<User, CreateUserDto, UpdateUserDto>
  implements IUserRepository
{
  constructor(@Inject('DRIZZLE') db: any) {
    super(db, users);
  }
}
