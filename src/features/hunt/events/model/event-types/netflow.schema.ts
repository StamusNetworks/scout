import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const netflowSchema = z.object({
  pkts: z.number(),
  bytes: z.number(),
  start: z.string().optional(),
  end: z.string().optional(),
  age: z.number(),
  min_ttl: z.number(),
  max_ttl: z.number(),
});

export const netflowEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('netflow'),
  netflow: netflowSchema,
});

export type NetflowEvent = z.infer<typeof netflowEventSchema>;
