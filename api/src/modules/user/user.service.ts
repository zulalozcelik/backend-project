import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  create(dto: CreateUserDto) {
    return this.userRepository.create(dto);
  }

  findAll() {
    return this.userRepository.findAll();
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
}
