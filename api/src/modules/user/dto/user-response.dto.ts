export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static fromEntityList(
    entities: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    }>,
  ): UserResponseDto[] {
    return entities.map((entity) => UserResponseDto.fromEntity(entity));
  }
}
