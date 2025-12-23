import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const rdpSchema = z.object({
  channels: z.array(z.string()).optional(),
  client: z
    .object({
      build: z.string(),
      capabilities: z.array(z.string()),
      client_name: z.string(),
      color_depth: z.number(),
      connection_hint: z.string(),
      desktop_height: z.number(),
      desktop_orientation: z.number().optional(),
      desktop_width: z.number(),
      device_scale_factor: z.number().optional(),
      function_keys: z.number(),
      id: z.string().optional(),
      keyboard_layout: z.string().optional(),
      keyboard_type: z.string().optional(),
      physical_height: z.number().optional(),
      physical_width: z.number().optional(),
      product_id: z.number(),
      scale_factor: z.number().optional(),
      version: z.string(),
    })
    .optional(),
  cookie: z.string().optional(),
  error_code: z.number().optional(),
  event_type: z.string(),
  flags: z.array(z.string()).optional(),
  protocol: z.string().optional(),
  reason: z.string().optional(),
  server_supports: z.array(z.string()).optional(),
  tx_id: z.number(),
  x509_serials: z.array(z.string()).optional(),
});

export const rdpEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('rdp'),
  rdp: rdpSchema,
});

export type RdpEvent = z.infer<typeof rdpEventSchema>;
