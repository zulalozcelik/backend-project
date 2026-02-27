import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const auditQuerySchema = z.object({
    entity: z.string().min(1).optional(),
    entityId: z.string().min(1).optional(),
    performedBy: z.string().min(1).optional(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export class AuditQueryDto extends createZodDto(auditQuerySchema) { }
