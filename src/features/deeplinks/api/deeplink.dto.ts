import { values } from 'ramda';
import { z } from 'zod';

import { FilterType } from '@/features/query-filters/definitions/query-filter.config';

const filterTypeEnum = z.enum(
  values(FilterType) as [(typeof FilterType)[keyof typeof FilterType]],
);

export const deeplinkDtoSchema = z.object({
  pk: z.number(),
  name: z.string(),
  template: z.string(),
  entities: z.array(z.object({ name: filterTypeEnum })),
  all: z.boolean(),
  user_defined: z.boolean(),
  enabled: z.boolean(),
});

export type DeeplinkDto = z.infer<typeof deeplinkDtoSchema>;

export type CreateDeeplinkDto = {
  name: string;
  template: string;
  entities: { name: DeeplinkDto['entities'][number]['name'] }[];
  all: boolean;
};

export type UpdateDeeplinkDto = Partial<CreateDeeplinkDto> & {
  pk: number;
  enabled?: boolean;
};
