import { z } from 'zod';

export const aiProcessRequestSchema = z.object({
  text: z.string().min(1),
});

export type AiProcessRequest = z.infer<typeof aiProcessRequestSchema>;
