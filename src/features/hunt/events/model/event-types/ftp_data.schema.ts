import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const ftpDataSchema = z.object({
  command: z.string(),
  filename: z.string(),
});

export const ftpDataEventSchema = baseFlowEventSchema.extend({
  ftp_data: ftpDataSchema,
});

export type FtpDataEvent = z.infer<typeof ftpDataEventSchema>;
