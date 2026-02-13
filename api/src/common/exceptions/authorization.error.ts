import { BaseAppException } from './base-app.exception';

export class AuthorizationError extends BaseAppException {
    constructor(
        message = 'Authorization failed',
        details?: Record<string, unknown>,
    ) {
        super(message, 'AUTHORIZATION_ERROR', 403, details);
    }
}
