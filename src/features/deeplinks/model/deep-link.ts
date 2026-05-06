import { values } from 'ramda';
import { z } from 'zod';

import { FilterType } from '@/features/query-filters/definitions/query-filter.config';

const filterTypeEnum = z.enum(
  values(FilterType) as [(typeof FilterType)[keyof typeof FilterType]],
);

export const deeplinkCreateSchema = z.object({
  name: z.string().min(1),
  template: z.union(
    [z.string().startsWith('http://'), z.string().startsWith('https://')],
    {
      message: 'URL must start with http:// or https://',
    },
  ),
  entities: z.array(filterTypeEnum),
  all: z.boolean(),
});

export type CreateDeeplink = z.infer<typeof deeplinkCreateSchema>;

export type Deeplink = CreateDeeplink & {
  id: number;
  userDefined: boolean;
  enabled: boolean;
};
