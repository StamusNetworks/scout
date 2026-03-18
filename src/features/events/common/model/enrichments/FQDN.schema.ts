import { z } from 'zod';

export const FQDNSchema = z.object({
  src: z.string().optional(),
  dest: z.string().optional(),
});
