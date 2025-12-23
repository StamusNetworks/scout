import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const krb5Schema = z.object({
  cname: z.string(),
  encryption: z.string(),
  error_code: z.string().optional(),
  failed_request: z.string().optional(),
  msg_type: z.string(),
  realm: z.string(),
  sname: z.string(),
  ticket_encryption: z.string().optional(),
  ticket_weak_encryption: z.boolean().optional(),
  weak_encryption: z.boolean(),
});

export const krb5EventSchema = baseFlowEventSchema.extend({
  event_type: z.literal('krb5'),
  krb5: krb5Schema,
});

export type Krb5Event = z.infer<typeof krb5EventSchema>;
