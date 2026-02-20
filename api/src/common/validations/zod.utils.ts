import { z } from 'zod';

/**
 * Strong password:
 * - Minimum 8 karakter
 * - En az 1 büyük harf
 * - En az 1 rakam
 * - En az 1 özel karakter
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Phone number (basit global format)
 */
export const phoneSchema = z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format');

/**
 * Future date validation
 */
export const futureDateSchema = z
    .date()
    .refine((date) => date.getTime() > Date.now(), {
        message: 'Date must be in the future',
    });

/**
 * UUID id validation (ileride lazım olacak)
 */
export const idSchema = z.string().uuid('Invalid UUID format');
