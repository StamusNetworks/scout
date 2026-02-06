import { z } from 'zod';

import { baseEventSchema } from '../event.schema';

export const ikeSchema = z.object({
  exchange_type: z.number(),
  ikev1: z.object({
    client: z.object({
      proposals: z.array(
        z.object({
          alg_auth: z.string(),
          alg_auth_raw: z.number(),
          alg_dh: z.string(),
          alg_dh_raw: z.number(),
          alg_enc: z.string(),
          alg_enc_raw: z.number(),
          alg_hash: z.string(),
          alg_hash_raw: z.number(),
          sa_life_duration: z.string(),
          sa_life_duration_raw: z.number(),
          sa_life_type: z.string(),
          sa_life_type_raw: z.number(),
        }),
      ),
    }),
    doi: z.number(),
    encrypted_payloads: z.boolean(),
    server: z.object({}),
  }),
  init_spi: z.string(),
  message_id: z.number(),
  payload: z.array(z.string()),
  resp_spi: z.string(),
  version_major: z.number(),
  version_minor: z.number(),
});

export const ikeEventSchema = baseEventSchema.extend({
  app_proto: z.literal('ike'),
  event_type: z.literal('ike'),
  ike: ikeSchema,
});

export type IkeEvent = z.infer<typeof ikeEventSchema>;
