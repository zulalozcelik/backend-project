import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { errorExamples } from '../../common/swagger/error-examples';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ─── POST /auth/register ──────────────────────────────────────────────────────
    @Post('register')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'email', 'password'],
            properties: {
                name: { type: 'string', example: 'Zülal Özçelik' },
                email: { type: 'string', format: 'email', example: 'zulal@example.com' },
                password: { type: 'string', minLength: 6, example: 'StrongPass123!' },
                trialEndsAt: { type: 'string', format: 'date-time', example: '2026-12-31T00:00:00.000Z' },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: { example: { data: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } },
    })
    @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto, schema: { example: errorExamples.badRequest } })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    // ─── POST /auth/login ─────────────────────────────────────────────────────────
    @Post('login')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email', example: 'zulal@example.com' },
                password: { type: 'string', minLength: 6, example: 'StrongPass123!' },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: { example: { data: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } } },
    })
    @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto, schema: { example: errorExamples.badRequest } })
    @ApiResponse({ status: 401, description: 'Invalid credentials', type: ErrorResponseDto, schema: { example: errorExamples.unauthorized } })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
