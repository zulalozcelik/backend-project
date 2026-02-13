export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface IGenericRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<T[]>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  withTransaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R>;
}
