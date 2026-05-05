import z from 'zod';

import { baseEventSchema } from '@/features/events/model/event';
import { killChainPhaseSchema } from '@/features/threats';

import { alertSchema } from './alert.schema';

export const stamusSchema = z.object({
  pk: z.number(),
  method_id: z.number(),
  asset: z.string(),
  asset_type: z.string(),
  source: z.string(),
  asset_net_info: z.string(),
  kill_chain: killChainPhaseSchema,
  kill_chain_offender: killChainPhaseSchema,
  extra_info: z.string(),
  family_id: z.number(),
  family_type: z.string(),
  threat_id: z.number(),
  threat_name: z.string().optional(),
  family_name: z.string().optional(),
});

export const stamusEventSchema = baseEventSchema.extend({
  event_type: z.literal('stamus'),
  stamus: stamusSchema,
  alert: alertSchema,
});

export type StamusEvent = z.infer<typeof stamusEventSchema>;
