import { keys } from 'ramda';
import z from 'zod';

import { baseEventSchema } from '@/features/events/common/events.model';
import { killChainsConfig } from '@/features/threats/common/killchain/killchain';

import { alertSchema } from './alert.schema';

export const stamusSchema = z.object({
  pk: z.number(),
  method_id: z.number(),
  asset: z.string(),
  asset_type: z.string(),
  source: z.string(),
  asset_net_info: z.string(),
  kill_chain: z.enum(keys(killChainsConfig) as [keyof typeof killChainsConfig]),
  kill_chain_offender: z.enum(
    keys(killChainsConfig) as [keyof typeof killChainsConfig],
  ),
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
