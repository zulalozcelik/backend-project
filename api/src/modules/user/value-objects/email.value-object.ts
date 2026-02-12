import { BadRequestException } from '@nestjs/common';

export class Email {
    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
    }

    static create(email: string): Email {
        if (!Email.isValid(email)) {
            throw new BadRequestException(`Invalid email format: ${email}`);
        }

        return new Email(email.toLowerCase().trim());
    }

    private static isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
