import { z } from 'zod';

import { baseEventSchema } from '@/features/events/common/events.model';

export const sipSchema = z.object({
  method: z.string(),
  request_line: z.string(),
  uri: z.string(),
  version: z.string(),
});

export const sipEventSchema = baseEventSchema.extend({
  event_type: z.literal('sip'),
  app_proto: z.literal('sip'),
  sip: sipSchema,
});

export type SipEvent = z.infer<typeof sipEventSchema>;
