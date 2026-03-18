import { z } from 'zod';

import { baseEventSchema } from '@/features/events/common/events.model';

export const quicSchema = z.object({
  extensions: z.array(
    z.object({
      name: z.string(),
      type: z.number(),
      values: z.array(z.string()).optional(),
    }),
  ),
  ja3: z
    .object({
      hash: z.string(),
      string: z.string(),
    })
    .optional(),
  ja3s: z
    .object({
      hash: z.string(),
      string: z.string(),
    })
    .optional(),
  ja4: z.string().optional(),
  sni: z.string().optional(),
  version: z.string(),
});

export const quicEventSchema = baseEventSchema.extend({
  quic: quicSchema,
});

export type QuicEvent = z.infer<typeof quicEventSchema>;
