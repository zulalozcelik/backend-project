import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
