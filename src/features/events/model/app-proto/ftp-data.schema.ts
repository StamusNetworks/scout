import { z } from 'zod';

import { baseEventSchema } from '@/features/events/model/event';

export const ftpDataSchema = z.object({
  command: z.string(),
  filename: z.string(),
});

export const ftpDataEventSchema = baseEventSchema.extend({
  event_type: z.literal('ftp_data'),
  ftp_data: ftpDataSchema,
});

export type FtpDataEvent = z.infer<typeof ftpDataEventSchema>;
