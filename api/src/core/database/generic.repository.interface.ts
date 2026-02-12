export interface IGenericRepository<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;

  update(id: string, data: UpdateDto): Promise<T | null>;

  findById(id: string): Promise<T | null>;

  findAll(skip?: number, limit?: number): Promise<T[]>;

  softDelete(id: string): Promise<void>;

  restore(id: string): Promise<void>;
}
