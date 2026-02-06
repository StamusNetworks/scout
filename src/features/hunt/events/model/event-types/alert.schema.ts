import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const alertSchema = z.object({
  action: z.string().optional(),
  category: z.string().optional(),
  gid: z.number().optional(),
  lateral: z.string().optional(),
  tag: z.string().optional(),
  metadata: z
    .object({
      mitre_tactic_name: z.array(z.string()).optional(),
      mitre_tactic_id: z.array(z.string()).optional(),
      mitre_technique_name: z.array(z.string()).optional(),
      mitre_technique_id: z.array(z.string()).optional(),
    })
    .optional(),
  rev: z.number().optional(),
  severity: z.number().optional(),
  signature: z.string(),
  signature_id: z.number(),
  source: z
    .object({
      ip: z.string(),
      port: z.number(),
      net_info: z.array(z.string()).optional(),
      net_info_agg: z.string().optional(),
    })
    .optional(),
  target: z
    .object({
      ip: z.string(),
      port: z.number(),
    })
    .optional(),
  xff: z.string().optional(),
});

export const alertEventSchema = baseEventSchema.extend({
  event_type: z.literal('alert'),
  alert: alertSchema,
});
export type AlertEvent = z.infer<typeof alertEventSchema>;
