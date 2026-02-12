import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { UpdateUserDto, updateUserSchema } from './dto/update-user.dto';
import type { EnvironmentVariables } from '../../common/configs/env.type';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private users: User[] = [];

  constructor(private readonly configService: ConfigService<EnvironmentVariables>) {}

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  create(data: CreateUserDto): User {
    const validatedData = createUserSchema.parse(data);

    const newUser: User = {
      id: crypto.randomUUID(),
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: string, data: UpdateUserDto): User {
    const user = this.findOne(id);
    const validatedData = updateUserSchema.parse(data);

    Object.assign(user, validatedData, {
      updatedAt: new Date(),
    });

    return user;
  }

  remove(id: string): { success: boolean; message: string } {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.users.splice(index, 1);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
