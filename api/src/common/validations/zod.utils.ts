import { z } from 'zod';
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');


export const phoneSchema = z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format');

export const futureDateSchema = z
    .date()
    .refine((date) => date.getTime() > Date.now(), {
        message: 'Date must be in the future',
    });

export const idSchema = z.string().uuid('Invalid UUID format');
