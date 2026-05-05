import { z } from 'zod';

import { baseEventSchema } from '@/features/events/model/event';

export const smtpSchema = z.object({
  helo: z.string(),
  mail_from: z.string().optional(),
  rcpt_to: z.array(z.string()).optional(),
});

export const smtpEventSchema = baseEventSchema.extend({
  event_type: z.literal('smtp'),
  app_proto: z.literal('smtp'),
  smtp: smtpSchema,
  email: z
    .object({
      attachment: z.array(z.string()).optional(),
    })
    .optional(),
});

export type SmtpEvent = z.infer<typeof smtpEventSchema>;
