export abstract class BaseAppException extends Error {
    public readonly type: string;
    public readonly statusCode: number;
    public readonly error: string;
    public readonly details?: Record<string, unknown>;

    protected constructor(
        message: string,
        type: string,
        statusCode: number,
        details?: Record<string, unknown>,
    ) {
        super(message);

        this.type = type;
        this.statusCode = statusCode;
        this.error = this.constructor.name;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

