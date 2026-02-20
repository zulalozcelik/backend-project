import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { z } from 'zod';

import { BusinessRuleError } from '../../common/exceptions/business-rule.error';
import { NotFoundError } from '../../common/exceptions/not-found.error';
import { AuthenticationError } from '../../common/exceptions/authentication.error';
import { AuthorizationError } from '../../common/exceptions/authorization.error';
import { ValidationError } from '../../common/exceptions/validation.error';

const failFastSchema = z.object({
    email: z.string().email(),
    age: z.number().int().min(18),
});

type FailFastBody = z.infer<typeof failFastSchema>;

@Controller('test')
export class TestController {
    // ✅ 200
    @Get('ok')
    @HttpCode(HttpStatus.OK)
    ok() {
        return { ok: true };
    }

    // ✅ 201
    @Post('created')
    @HttpCode(HttpStatus.CREATED)
    created() {
        return { created: true };
    }

    // ✅ 400 (ValidationError) - Fail Fast örneği
    @Post('fail-fast')
    @HttpCode(HttpStatus.OK)
    failFast(@Body() body: unknown) {
        const parsed = failFastSchema.safeParse(body);
        if (!parsed.success) {
            // Fail Fast: daha service'e gitmeden burada patlatıyoruz
            throw new ValidationError('Invalid request body', {
                issues: parsed.error.issues,
            });
        }

        const data: FailFastBody = parsed.data;
        return { received: data };
    }

    // ✅ 400 (BusinessRuleError)
    @Get('business-rule')
    businessRule() {
        throw new BusinessRuleError('You cannot do this action right now');
    }

    // ✅ 401
    @Get('unauthorized')
    unauthorized() {
        throw new AuthenticationError('You must login');
    }

    // ✅ 403
    @Get('forbidden')
    forbidden() {
        throw new AuthorizationError('You do not have permission');
    }

    // ✅ 404
    @Get('not-found')
    notFound() {
        throw new NotFoundError('Record not found');
    }

    // ✅ 500
    @Get('server-error')
    serverError() {
        // bilinmeyen hata → filter 500 döndürmeli
        throw new Error('Unexpected crash');
    }
}
