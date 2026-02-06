import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const ikev2Schema = z.object({
  errors: z.number(),
  exchange_type: z.number(),
  init_spi: z.string(),
  message_id: z.number(),
  notify: z.array(z.any()),
  payload: z.array(z.string()),
  resp_spi: z.string(),
  role: z.string(),
  version_major: z.number(),
  version_minor: z.number(),
});

export const ikev2EventSchema = baseEventSchema.extend({
  ikev2: ikev2Schema,
});

export type Ikev2Event = z.infer<typeof ikev2EventSchema>;
