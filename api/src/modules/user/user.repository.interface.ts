import type { IGenericRepository } from '../../core/database/generic.repository.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './entities/user.entity';

export interface IUserRepository
    extends IGenericRepository<User, CreateUserDto, UpdateUserDto> {
    findByEmail(email: string): Promise<User | null>;
    findAuthByEmail(email: string): Promise<{ id: string; password: string } | null>;
}
