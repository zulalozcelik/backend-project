// Swagger @ApiResponse schema: { example: ... } için hazır örnek değerler.
// Her status kodu için doğru statusCode içeriyor.
// Controller'larda tek tek yazmak yerine buradan import edilir.
export const errorExamples = {
    badRequest: {
        statusCode: 400,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
    unauthorized: {
        statusCode: 401,
        error: 'AUTHENTICATION_ERROR',
        message: 'Unauthorized',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users/me',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
    forbidden: {
        statusCode: 403,
        error: 'AUTHORIZATION_ERROR',
        message: 'Forbidden',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users/123',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
    notFound: {
        statusCode: 404,
        error: 'NOT_FOUND_ERROR',
        message: 'Resource not found',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users/123',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
    tooManyRequests: {
        statusCode: 429,
        error: 'TOO_MANY_REQUESTS',
        message: 'Too Many Requests',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users/me',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
    internal: {
        statusCode: 500,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
        timestamp: '2026-02-23T12:00:00.000Z',
        path: '/users',
        requestId: '3fa8c721-ab12-4567-89ab-cdef01234567',
    },
} as const;
