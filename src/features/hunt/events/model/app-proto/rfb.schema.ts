import { z } from 'zod';

import { baseEventSchema } from '@/features/events/common/events.model';

export const rfbSchema = z.object({
  authentication: z.object({
    security_result: z.string().optional(),
    security_type: z.number(),
    vnc: z
      .object({
        challenge: z.string(),
        response: z.string(),
      })
      .optional(),
  }),
  client_protocol_version: z.object({
    major: z.string(),
    minor: z.string(),
  }),
  framebuffer: z
    .object({
      height: z.number(),
      name: z.string(),
      pixel_format: z
        .object({
          big_endian: z.boolean(),
          bits_per_pixel: z.number(),
          blue_max: z.number(),
          blue_shift: z.number(),
          depth: z.number(),
          green_max: z.number(),
          green_shift: z.number(),
          red_max: z.number(),
          red_shift: z.number(),
          true_color: z.boolean(),
        })
        .optional(),
      width: z.number(),
    })
    .optional(),
  screen_shared: z.boolean().optional(),
  server_protocol_version: z.object({
    major: z.string(),
    minor: z.string(),
  }),
  server_security_failure_reason: z.string().optional(),
});

export const rfbEventSchema = baseEventSchema.extend({
  event_type: z.literal('rfb'),
  app_proto: z.literal('rfb'),
  rfb: rfbSchema,
});

export type RfbEvent = z.infer<typeof rfbEventSchema>;
