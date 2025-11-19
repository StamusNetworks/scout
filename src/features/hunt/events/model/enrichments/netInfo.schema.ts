import { z } from 'zod';

export const netInfoSchema = z.object({
  src: z.array(z.string()).optional(),
  src_agg: z.string().optional(),
  dest: z.array(z.string()).optional(),
  dest_agg: z.string().optional(),
});
