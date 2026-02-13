import { BaseAppException } from './base-app.exception';

export class BusinessRuleError extends BaseAppException {
    constructor(
        message = 'Business rule violated',
        details?: Record<string, unknown>,
    ) {
        super(message, 'BUSINESS_RULE_ERROR', 400, details);
    }
}
