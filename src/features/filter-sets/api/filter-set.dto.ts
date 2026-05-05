import { z } from 'zod';

import { qfilterDef } from '@/features/query-filters/model/query-filter';

/**
 * Wire-shape schema for filter-set tags. The server uses `alerts` and
 * `sightings`; the domain uses `alert` and `discovery`. Translation
 * happens in `filter-set.transforms.ts`.
 */
export const filterSetTagsDto = z.object({
  stamus: z.boolean().optional(),
  alerts: z.boolean(),
  sightings: z.boolean(),
  informational: z.boolean(),
  relevant: z.boolean(),
  untagged: z.boolean(),
});
export type FilterSetTagsDto = z.infer<typeof filterSetTagsDto>;

/**
 * Wire-shape schema for a saved filter set. The `content` array is a
 * tagged union of persisted filters and a single optional `alert.tag`
 * entry holding the active flags. The transform layer flattens this
 * into the domain `{ filters, flags }` shape.
 */
export const filterSetDto = z.object({
  content: z.array(
    qfilterDef.or(
      z.object({
        id: z.literal('alert.tag'),
        value: filterSetTagsDto,
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
export type FilterSetDto = z.infer<typeof filterSetDto>;

export const filterSetCreatePayloadDto = z.object({
  name: z.string(),
  page: z.string(),
  share: z.enum(['static', 'global', 'private']).optional(),
  description: z.string(),
  filters: z.array(qfilterDef),
  tags: filterSetTagsDto.optional(),
});
export type FilterSetCreatePayloadDto = z.infer<
  typeof filterSetCreatePayloadDto
>;
