import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const flowSchema = z.object({
  src_ip: z.string().optional(),
  src_port: z.number().optional(),
  dest_ip: z.string().optional(),
  dest_port: z.number().optional(),
  action: z.string().optional(),
  start: z.string(),
  end: z.string().optional(),
  age: z.number(),
  bytes_toserver: z.number(),
  bytes_toclient: z.number(),
  pkts_toserver: z.number(),
  pkts_toclient: z.number(),
  state: z.string(),
  reason: z.string().optional(),
  alerted: z.boolean(),
  bypass: z.string().optional(),
  had_gap: z.boolean().optional(),
  tx_cnt: z.number().optional(),
});

export const flowEventSchema = baseFlowEventSchema.extend({
  flow: flowSchema,
});

export type FlowEvent = z.infer<typeof flowEventSchema>;
