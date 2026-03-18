import { z } from 'zod';

export const trafficSchema = z.object({
  id: z.array(z.string()).optional(),
  label: z.array(z.string()).optional(),
});
