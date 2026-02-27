import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from './user.repository.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { Email } from './value-objects/email.value-object';
import { EventBusService } from '../../common/events/event-bus.service';
import { USER_CREATED_EVENT, UserCreatedEvent } from '../../domain/events/user-created.event';
import { USER_UPDATED_EVENT, UserUpdatedEvent } from '../../domain/events/user-updated.event';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBusService,
  ) { }

  async create(dto: CreateUserDto, performedBy = 'system') {
    const created = await this.userRepository.withTransaction(async () => {
      Email.create(dto.email);
      return this.userRepository.create(dto);
    });

    const evt: UserCreatedEvent = {
      entity: 'users',
      entityId: created.id,
      newData: created as unknown as Record<string, unknown>,
      performedBy,
      timestamp: new Date().toISOString(),
    };
    this.eventBus.emit(USER_CREATED_EVENT, evt);

    return created;
  }

  findAll(skip?: number, limit?: number) {
    return this.userRepository.findAll({ skip, limit });
  }

  findOne(id: string) {
    return this.userRepository.findById(id);
  }

  async findOneForAudit(id: string): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findById(id);
    return user as unknown as Record<string, unknown>;
  }

  async update(id: string, dto: UpdateUserDto, performedBy = 'system') {
    const oldUser = await this.userRepository.findById(id);
    const updated = await this.userRepository.update(id, dto);

    if (updated) {
      const evt: UserUpdatedEvent = {
        entity: 'users',
        entityId: updated.id,
        oldData: oldUser as unknown as Record<string, unknown>,
        newData: updated as unknown as Record<string, unknown>,
        performedBy,
        timestamp: new Date().toISOString(),
      };
      this.eventBus.emit(USER_UPDATED_EVENT, evt);
    }

    return updated;
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
