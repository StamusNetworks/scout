import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const nfsRcpSchema = z.object({
  auth_type: z.string(),
  status: z.string(),
  xid: z.number(),
});

export const nfsRcpEventSchema = baseEventSchema.extend({
  nfs_rcp: nfsRcpSchema,
});

export type NfsRcpEvent = z.infer<typeof nfsRcpEventSchema>;
