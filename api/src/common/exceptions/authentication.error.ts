import { BaseAppException } from './base-app.exception';

export class AuthenticationError extends BaseAppException {
    constructor(
        message = 'Authentication failed',
        details?: Record<string, unknown>,
    ) {
        super(message, 'AUTHENTICATION_ERROR', 401, details);
    }
}
