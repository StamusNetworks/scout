import { z } from 'zod';

import { killChainSchema } from '@/features/hunt/killchain/killchain';

export const threatStatusSchema = z.object({
  id: z.number(),
  status: z.union([z.literal('new'), z.literal('fixed')]),
  tenant: z.number(),
  first_seen: z.string(),
  last_seen: z.string(),
  close_status_date: z.string(),
  kill_chain: killChainSchema,
  kill_chain_offender: killChainSchema,
  threat_id: z.number(),
  asset: z.string(),
  is_offender: z.boolean(),
});

export type ThreatStatus = z.infer<typeof threatStatusSchema>;
