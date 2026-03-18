import { values } from 'ramda';
import { z } from 'zod';

import { FilterType } from '@/features/filtering/query-filters/constants/query-filter.config';

export const deeplinkCreateSchema = z.object({
  name: z.string().min(1),
  template: z.union(
    [z.string().startsWith('http://'), z.string().startsWith('https://')],
    {
      message: 'URL must start with http:// or https://',
    },
  ),
  entities: z.array(
    z.enum(
      values(FilterType) as [(typeof FilterType)[keyof typeof FilterType]],
    ),
  ),
  all: z.boolean(),
});

export type CreateDeeplink = z.infer<typeof deeplinkCreateSchema>;

export const deeplinkSchema = deeplinkCreateSchema.extend({
  pk: z.number(),
  user_defined: z.boolean(),
  enabled: z.boolean(),
  entities: z.array(
    z.object({
      name: z.enum(
        values(FilterType) as [(typeof FilterType)[keyof typeof FilterType]],
      ),
    }),
  ),
});

export type Deeplink = z.infer<typeof deeplinkSchema>;
