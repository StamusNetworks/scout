import { z } from 'zod';

import { qfilterDef } from './query-filter';

export const queryFilterSetCreatePayload = z.object({
  name: z.string(),
  page: z.string(),
  share: z.enum(['static', 'global', 'private']).optional(),
  description: z.string(),
  filters: z.array(qfilterDef),
  tags: z
    .object({
      stamus: z.boolean(),
      alert: z.boolean(),
      discovery: z.boolean(),
      informational: z.boolean(),
      relevant: z.boolean(),
      untagged: z.boolean(),
    })
    .optional(),
});

export const queryFilterSetSchema = z.object({
  content: z.array(
    qfilterDef.or(
      z.object({
        id: z.literal('alert.tag'),
        value: z.object({
          stamus: z.boolean(),
          alerts: z.boolean(),
          sightings: z.boolean(),
          informational: z.boolean(),
          relevant: z.boolean(),
          untagged: z.boolean(),
        }),
      }),
    ),
  ),
  name: z.string(),
  page: z.string(),
  description: z.string(),
  id: z.number(),
  imported: z.boolean(),
  share: z.enum(['static', 'global', 'private']).optional(),
});

export type QueryFilterSet = z.infer<typeof queryFilterSetSchema>;
export type QueryFilterSetCreatePayload = z.infer<
  typeof queryFilterSetCreatePayload
>;
