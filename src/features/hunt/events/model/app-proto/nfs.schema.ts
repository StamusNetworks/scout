import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const nfsSchema = z.object({
  file_tx: z.boolean(),
  filename: z.string(),
  id: z.number(),
  procedure: z.string(),
  status: z.string(),
  type: z.string(),
  version: z.number(),
});

export const nfsEventSchema = baseEventSchema.extend({
  event_type: z.literal('nfs'),
  app_proto: z.literal('nfs'),
  nfs: nfsSchema,
});

export type NfsEvent = z.infer<typeof nfsEventSchema>;
