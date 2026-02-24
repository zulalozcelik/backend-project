import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '8a76aee9-0785-48c6-8b64-a3aa55189dfb' })
  id!: string;

  @ApiProperty({ example: 'Zülal Özçelik' })
  name!: string;

  @ApiProperty({ example: 'zulal@example.com' })
  email!: string;

  @ApiProperty({ example: '2026-02-23T10:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-02-23T10:30:00.000Z' })
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
