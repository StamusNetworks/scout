import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';
import { alertSchema } from './alert.schema';

export const stamusSchema = z.object({
  pk: z.number(),
  method_id: z.number(),
  asset: z.string(),
  asset_type: z.string(),
  source: z.string(),
  asset_net_info: z.string(),
  kill_chain: z.string(),
  extra_info: z.string(),
  family_id: z.number(),
  family_type: z.string(),
  threat_id: z.number(),
  threat_name: z.string().optional(),
  family_name: z.string().optional(),
});

export const stamusEventSchema = baseFlowEventSchema.extend({
  stamus: stamusSchema,
  alert: alertSchema,
});

export type StamusEvent = z.infer<typeof stamusEventSchema>;
