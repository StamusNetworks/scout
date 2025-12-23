import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const tftpSchema = z.object({
  file: z.string(),
  mode: z.string(),
  packet: z.string(),
});

export const tftpEventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('tftp'),
  tftp: tftpSchema,
});

export type TftpEvent = z.infer<typeof tftpEventSchema>;
