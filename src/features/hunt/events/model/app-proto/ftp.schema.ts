import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const ftpSchema = z.object({
  command: z.string().optional(),
  command_data: z.string().optional(),
  command_truncated: z.boolean().optional(),
  completion_code: z.array(z.string()),
  dynamic_port: z.number().optional(),
  mode: z.string().optional(),
  reply: z.array(z.string()),
  reply_received: z.string(),
  reply_truncated: z.boolean().optional(),
});

export const ftpEventSchema = baseEventSchema.extend({
  event_type: z.literal('ftp'),
  app_proto: z.literal('ftp'),
  ftp: ftpSchema,
});

export type FtpEvent = z.infer<typeof ftpEventSchema>;
