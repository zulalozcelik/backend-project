import { BaseAppException } from './base-app.exception';

export class NotFoundError extends BaseAppException {
    constructor(message = 'Record not found', details?: Record<string, unknown>) {
        super(message, 'NOT_FOUND_ERROR', 404, details);
    }
}
