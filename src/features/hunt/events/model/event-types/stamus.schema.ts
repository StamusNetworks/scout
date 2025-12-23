import { keys } from 'ramda';
import { z } from 'zod';

import { killChainsConfig } from '@/features/hunt/killchain/killchain';

import { baseFlowEventSchema } from '../flowEvent.schema';
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

export const stamusEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('stamus'),
  app_proto: z.literal('stamus'),
  stamus: stamusSchema,
  alert: alertSchema,
});

export type StamusEvent = z.infer<typeof stamusEventSchema>;
