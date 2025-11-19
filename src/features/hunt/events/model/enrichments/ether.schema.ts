import { z } from 'zod';

export const etherSchema = z.object({
  src_mac: z.string().optional(),
  dest_mac: z.string().optional(),
  src_macs: z.array(z.string()).optional(),
  dest_macs: z.array(z.string()).optional(),
});
