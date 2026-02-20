import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../../../core/database/schema.js';
import {
    passwordSchema,
    phoneSchema,
} from '../../../common/validations/zod.utils.js';

export const userInsertSchema = createInsertSchema(users, {
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),

    password: passwordSchema,

    phone: phoneSchema.optional(),

    trialEndsAt: z.coerce.date().refine(
        (date) => date.getTime() > Date.now(),
        { message: 'Trial end date must be in the future' },
    ),
})
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
    })
    // güvenlik: ekstra alanları otomatik at
    .strip();

export const userUpdateSchema = userInsertSchema.partial().strip();

export const userSelectSchema = createSelectSchema(users);
