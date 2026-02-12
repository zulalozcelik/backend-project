export class UserEntity {
    private constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly deletedAt: Date | null,
    ) { }

    static create(data: {
        name: string;
        email: string;
    }): UserEntity {
        return new UserEntity(
            crypto.randomUUID(),
            data.name,
            data.email,
            new Date(),
            new Date(),
            null,
        );
    }

    static fromDatabase(data: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }): UserEntity {
        return new UserEntity(
            data.id,
            data.name,
            data.email,
            data.createdAt,
            data.updatedAt,
            data.deletedAt,
        );
    }

    isDeleted(): boolean {
        return this.deletedAt !== null;
    }

    update(data: { name?: string; email?: string }): UserEntity {
        return new UserEntity(
            this.id,
            data.name ?? this.name,
            data.email ?? this.email,
            this.createdAt,
            new Date(),
            this.deletedAt,
        );
    }
}
