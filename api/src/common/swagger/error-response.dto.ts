import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {

    @ApiProperty({ description: 'HTTP status code' })
    statusCode!: number;

    @ApiProperty({ example: 'VALIDATION_ERROR' })
    error!: string;

    @ApiProperty({ example: 'Validation failed' })
    message!: string;

    @ApiProperty({ example: '2026-02-23T12:00:00.000Z' })
    timestamp!: string;

    @ApiProperty({ example: '/users' })
    path!: string;

    @ApiProperty({ example: '3fa8c721-ab12-4567-89ab-cdef01234567' })
    requestId!: string;

    @ApiProperty({ required: false })
    details?: unknown;
}
