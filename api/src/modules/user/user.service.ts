import { Inject, Injectable } from '@nestjs/common';
import type { IGenericRepository } from '../../core/database/generic.repository.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './entities/user.entity';
import { Email } from './value-objects/email.value-object';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IGenericRepository<User, CreateUserDto, UpdateUserDto>,
  ) {}

  create(dto: CreateUserDto) {
    // Email value object ile validasyon + transaction örneği
    return this.userRepository.withTransaction(async () => {
      Email.create(dto.email); // Validasyon — hata varsa transaction rollback olur
      return this.userRepository.create(dto);
    });
  }

  findAll(skip?: number, limit?: number) {
    return this.userRepository.findAll({ skip, limit });
  }

  findOne(id: string) {
    return this.userRepository.findById(id);
  }

  update(id: string, dto: UpdateUserDto) {
    return this.userRepository.update(id, dto);
  }

  remove(id: string) {
    return this.userRepository.softDelete(id);
  }

  restore(id: string) {
    return this.userRepository.restore(id);
  }
}
