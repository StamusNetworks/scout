import { z } from 'zod';

import { type DatesState } from '@/features/filtering/dates-filters/dates-filters.types';
import { type QueryFilterState } from '@/features/filtering/query-filters/model/query-filter';
import { type TagFilters } from '@/features/filtering/query-filters/store/query-filters.slice';

const shareableFilterSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number()]),
  negated: z.boolean().optional(),
  wildcarded: z.boolean().optional(),
});

const shareableTimeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('all') }),
  z.object({ type: z.literal('auto') }),
  z.object({
    type: z.literal('from'),
    duration: z.number(),
    unit: z.enum([
      'seconds',
      'minutes',
      'hours',
      'days',
      'weeks',
      'months',
      'years',
    ]),
  }),
  z.object({
    type: z.literal('range'),
    start: z.number(),
    end: z.number(),
  }),
]);

const tagFiltersSchema = z.object({
  alert: z.boolean(),
  stamus: z.boolean(),
  discovery: z.boolean(),
  relevant: z.boolean(),
  informational: z.boolean(),
  untagged: z.boolean(),
  novelty: z.boolean(),
});

const shareableStateSchema = z.object({
  route: z.string().startsWith('/'),
  tenant: z.number().optional(),
  time: shareableTimeSchema,
  tags: tagFiltersSchema,
  filters: z.array(shareableFilterSchema),
});

export type ShareableFilter = z.infer<typeof shareableFilterSchema>;
export type ShareableTime = z.infer<typeof shareableTimeSchema>;
export type ShareableState = z.infer<typeof shareableStateSchema>;

export const encodeShareableState = (state: ShareableState): string => {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  const binary = String.fromCodePoint(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeShareableState = (
  encoded: string,
): ShareableState | null => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.codePointAt(0)!);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    const result = shareableStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

const buildTimePayload = (dates: DatesState): ShareableTime => {
  switch (dates.type) {
    case 'all':
      return { type: 'all' };
    case 'auto':
      return { type: 'auto' };
    case 'from':
      return {
        type: 'from',
        duration: dates.from_duration!,
        unit: dates.from_unit!,
      };
    case 'range':
      return {
        type: 'range',
        start: dates.start_date!,
        end: dates.end_date!,
      };
  }
};

export const buildShareableState = (
  route: string,
  dates: DatesState,
  queryFilters: QueryFilterState[],
  tagFilters: TagFilters,
  tenant: number | undefined,
): ShareableState => ({
  route,
  ...(tenant !== undefined && { tenant }),
  time: buildTimePayload(dates),
  tags: { ...tagFilters },
  filters: queryFilters
    .filter((f) => !f.is_suspended)
    .map((f) => ({
      key: f.key,
      value: f.value,
      ...(f.is_negated && { negated: true }),
      ...(f.is_wildcarded && { wildcarded: true }),
    })),
});

export const buildShareUrl = (
  state: ShareableState,
  origin: string,
  basePath: string,
): string => {
  const encoded = encodeShareableState(state);
  const base = basePath.replace(/\/+$/, '');
  return `${origin}${base}/share?s=${encoded}`;
};
