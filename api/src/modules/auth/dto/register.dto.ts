import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    trialEndsAt: z.coerce.date().optional(),
});

export class RegisterDto extends createZodDto(registerSchema) { }
