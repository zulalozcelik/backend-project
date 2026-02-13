import { IGenericRepository, PaginationParams } from './generic.repository.interface';

export abstract class BaseRepository<T, CreateDto, UpdateDto> implements IGenericRepository<
  T,
  CreateDto,
  UpdateDto
> {
  abstract create(data: CreateDto): Promise<T>;

  abstract update(id: string, data: UpdateDto): Promise<T | null>;

  abstract findById(id: string): Promise<T | null>;

  abstract findAll(params?: PaginationParams): Promise<T[]>;

  abstract softDelete(id: string): Promise<void>;

  abstract restore(id: string): Promise<void>;

  abstract withTransaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R>;
}
