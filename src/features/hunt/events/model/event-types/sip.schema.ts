import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const sipSchema = z.object({
  method: z.string(),
  request_line: z.string(),
  uri: z.string(),
  version: z.string(),
});

export const sipEventSchema = baseFlowEventSchema.extend({
  sip: sipSchema,
});

export type SipEvent = z.infer<typeof sipEventSchema>;
