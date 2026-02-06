import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const flowSchema = z.object({
  src_ip: z.string(),
  src_port: z.number(),
  dest_ip: z.string(),
  dest_port: z.number(),
  action: z.string().optional(),
  start: z.string(),
  end: z.string().optional(),
  age: z.number().optional(),
  bytes_toserver: z.number().optional(),
  bytes_toclient: z.number().optional(),
  pkts_toserver: z.number().optional(),
  pkts_toclient: z.number().optional(),
  state: z.string(),
  reason: z.string().optional(),
  alerted: z.boolean(),
  bypass: z.string().optional(),
  had_gap: z.boolean().optional(),
  tx_cnt: z.number().optional(),
});

export const flowEventSchema = baseEventSchema.extend({
  event_type: z.literal('flow'),
  flow: flowSchema,
});

export type FlowEvent = z.infer<typeof flowEventSchema>;
