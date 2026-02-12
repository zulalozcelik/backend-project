import { IGenericRepository } from './generic.repository.interface';

export abstract class BaseRepository<
  T,
  CreateDto,
  UpdateDto
> implements IGenericRepository<T, CreateDto, UpdateDto> {

  abstract create(data: CreateDto): Promise<T>;

  abstract update(id: string, data: UpdateDto): Promise<T | null>;

  abstract findById(id: string): Promise<T | null>;

  abstract findAll(): Promise<T[]>;

  abstract softDelete(id: string): Promise<void>;
}
  