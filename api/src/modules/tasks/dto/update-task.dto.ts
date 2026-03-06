import { z } from 'zod';

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  isDone: z.boolean().optional(),
});

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
