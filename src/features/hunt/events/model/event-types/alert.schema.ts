import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const alertSchema = z.object({
  action: z.string().optional(),
  category: z.string().optional(),
  gid: z.number().optional(),
  lateral: z.string().optional(),
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
    })
    .optional(),
  tag: z.string().optional(),
  target: z
    .object({
      ip: z.string(),
      port: z.number(),
    })
    .optional(),
});

export const flowAlertSchema = baseFlowEventSchema.extend({
  alert: alertSchema,
});

export type FlowAlert = z.infer<typeof flowAlertSchema>;
