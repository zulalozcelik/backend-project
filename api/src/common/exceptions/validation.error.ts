import { BaseAppException } from './base-app.exception';

export class ValidationError extends BaseAppException {
    constructor(message = 'Validation error', details?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}
