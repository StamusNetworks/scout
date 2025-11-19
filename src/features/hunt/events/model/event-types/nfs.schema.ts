import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const nfsSchema = z.object({
  file_tx: z.boolean(),
  filename: z.string(),
  id: z.number(),
  procedure: z.string(),
  status: z.string(),
  type: z.string(),
  version: z.number(),
});

export const nfsEventSchema = baseFlowEventSchema.extend({
  nfs: nfsSchema,
});

export type NfsEvent = z.infer<typeof nfsEventSchema>;
