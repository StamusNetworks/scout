import { z } from 'zod';

import { baseFlowEventSchema } from '../flowEvent.schema';

export const smtpSchema = z.object({
  helo: z.string(),
  mail_from: z.string().optional(),
  rcpt_to: z.array(z.string()).optional(),
});

export const smtpEventSchema = baseFlowEventSchema.extend({
  smtp: smtpSchema,
  email: z
    .object({
      attachment: z.array(z.string()).optional(),
    })
    .optional(),
});

export type SmtpEvent = z.infer<typeof smtpEventSchema>;
