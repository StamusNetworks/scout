import z from 'zod';

export const discoverySchema = z.object({
  asset_role: z.array(z.string()),
  key: z.string(),
  asset: z.string(),
  value: z.string(),
  asset_net: z.string(),
});
