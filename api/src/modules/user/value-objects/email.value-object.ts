export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    if (!value.includes('@')) {
      throw new Error('Invalid email format');
    }

    return new Email(value);
  }

  getValue(): string {
    return this.value;
  }
}
