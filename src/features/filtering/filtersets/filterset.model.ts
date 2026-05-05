import { z } from 'zod';

import {
  PersistedFilter,
  qfilterDef,
} from '@/features/query-filters/query-filter.model';

export const persistedTagsSchema = z.object({
  stamus: z.boolean().optional(),
  alerts: z.boolean(),
  sightings: z.boolean(),
  informational: z.boolean(),
  relevant: z.boolean(),
  untagged: z.boolean(),
});
export type PersistedTags = z.infer<typeof persistedTagsSchema>;

export const queryFilterSetCreatePayload = z.object({
  name: z.string(),
  page: z.string(),
  share: z.enum(['static', 'global', 'private']).optional(),
  description: z.string(),
  filters: z.array(qfilterDef),
  tags: persistedTagsSchema.optional(),
});

export const queryFilterSetSchema = z.object({
  content: z.array(
    qfilterDef.or(
      z.object({
        id: z.literal('alert.tag'),
        value: persistedTagsSchema,
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

export function getTagsFromFilterSet(
  filterSet: QueryFilterSet,
): PersistedTags | undefined {
  return filterSet.content.find((item) => item.id === 'alert.tag')
    ?.value as unknown as PersistedTags | undefined;
}
export function getFiltersFromFilterSet(
  filterSet: QueryFilterSet,
): PersistedFilter[] | undefined {
  return filterSet.content.filter(
    (item) => item.id !== 'alert.tag',
  ) as unknown as PersistedFilter[] | undefined;
}
