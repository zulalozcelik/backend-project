import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
