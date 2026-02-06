import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const tftpSchema = z.object({
  file: z.string(),
  mode: z.string(),
  packet: z.string(),
});

export const tftpEventSchema = baseEventSchema.extend({
  event_type: z.literal('tftp'),
  app_proto: z.literal('tftp'),
  tftp: tftpSchema,
});

export type TftpEvent = z.infer<typeof tftpEventSchema>;
