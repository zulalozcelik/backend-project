import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiBody, ApiResponse, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { RateLimit } from '@/common/decorators/rate-limit.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto';
import { ErrorResponseDto } from '../../common/swagger/error-response.dto';
import { errorExamples } from '../../common/swagger/error-examples';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // ─── POST /users ─────────────────────────────────────────────────────────────
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password', 'trialEndsAt'],
      properties: {
        name: { type: 'string', example: 'Zülal Özçelik' },
        email: { type: 'string', format: 'email', example: 'zulal@example.com' },
        password: { type: 'string', minLength: 6, example: 'StrongPass123!' },
        phone: { type: 'string', example: '+905551234567' },
        trialEndsAt: { type: 'string', format: 'date-time', example: '2026-12-31T00:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto, schema: { example: errorExamples.badRequest } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // ─── GET /users ──────────────────────────────────────────────────────────────
  @Get()
  @ApiQuery({ name: 'skip', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  findAll(@Query('skip') skip?: string, @Query('limit') limit?: string) {
    return this.userService.findAll(
      skip ? Number(skip) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // ─── GET /users/me ───────────────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit({ limit: 100, window: 60 })
  @ApiBearerAuth('bearer')
  @ApiResponse({ status: 200, description: 'Current authenticated user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication error', type: ErrorResponseDto, schema: { example: errorExamples.unauthorized } })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded', type: ErrorResponseDto, schema: { example: errorExamples.tooManyRequests } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  me(@CurrentUser() user: any) {
    return { data: user };
  }

  // ─── GET /users/:id ──────────────────────────────────────────────────────────
  @Get(':id')
  @ApiParam({ name: 'id', example: '8a76aee9-0785-48c6-8b64-a3aa55189dfb' })
  @ApiResponse({ status: 200, description: 'User by ID', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ErrorResponseDto, schema: { example: errorExamples.notFound } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // ─── PATCH /users/:id ────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiParam({ name: 'id', example: '8a76aee9-0785-48c6-8b64-a3aa55189dfb' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Name' },
        email: { type: 'string', format: 'email', example: 'new@example.com' },
        password: { type: 'string', minLength: 6, example: 'NewPass123!' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponseDto, schema: { example: errorExamples.badRequest } })
  @ApiResponse({ status: 404, description: 'User not found', type: ErrorResponseDto, schema: { example: errorExamples.notFound } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // ─── DELETE /users/:id ───────────────────────────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiParam({ name: 'id', example: '8a76aee9-0785-48c6-8b64-a3aa55189dfb' })
  @ApiResponse({ status: 200, description: 'User deleted', schema: { example: { data: { deleted: true } } } })
  @ApiResponse({ status: 401, description: 'Authentication error', type: ErrorResponseDto, schema: { example: errorExamples.unauthorized } })
  @ApiResponse({ status: 403, description: 'Admin role required', type: ErrorResponseDto, schema: { example: errorExamples.forbidden } })
  @ApiResponse({ status: 404, description: 'User not found', type: ErrorResponseDto, schema: { example: errorExamples.notFound } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { data: { deleted: true } };
  }

  // ─── PATCH /users/:id/restore ────────────────────────────────────────────────
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('bearer')
  @ApiParam({ name: 'id', example: '8a76aee9-0785-48c6-8b64-a3aa55189dfb' })
  @ApiResponse({ status: 200, description: 'User restored', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication error', type: ErrorResponseDto, schema: { example: errorExamples.unauthorized } })
  @ApiResponse({ status: 403, description: 'Admin role required', type: ErrorResponseDto, schema: { example: errorExamples.forbidden } })
  @ApiResponse({ status: 404, description: 'User not found', type: ErrorResponseDto, schema: { example: errorExamples.notFound } })
  @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto, schema: { example: errorExamples.internal } })
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }
}
