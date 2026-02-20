import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from './user.repository.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { Email } from './value-objects/email.value-object';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
  ) { }

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
  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findAuthByEmail(email: string) {
    return this.userRepository.findAuthByEmail(email);
  }
}
