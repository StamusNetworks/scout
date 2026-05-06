import { z } from 'zod';

import { type DatesPayload, type DatesState } from '@/features/dates';
import {
  type FilterFlags,
  type SerializedFilterFlags,
  toSerializedFilterFlags,
} from '@/features/query-filters/model/filter-flags';
import { type QueryFilterState } from '@/features/query-filters/model/query-filter';
import { type FilterInput } from '@/features/query-filters/utils/filter-mapper';

/**
 * Filter `key` shapes that are valid in this codebase: alphanumeric +
 * dot/underscore (e.g. `src_ip`, `host_id.roles.name`,
 * `alert.signature_id`). The key flows into qfilter template strings
 * so we constrain it here — the value goes through `esEscape` at the
 * builder, but the key does not.
 */
const FILTER_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_.]*$/;

const shareableFilterSchema = z.object({
  key: z.string().regex(FILTER_KEY_RE),
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

const shareableFlagsSchema = z.object({
  alert: z.boolean(),
  stamus: z.boolean(),
  discovery: z.boolean(),
  relevant: z.boolean(),
  informational: z.boolean(),
  untagged: z.boolean(),
  novelty: z.boolean(),
}) satisfies z.ZodType<SerializedFilterFlags>;

/**
 * Route must be a same-origin path: starts with `/`, doesn't try to
 * escape into another origin (`//evil.com` or `/\\evil`), no embedded
 * protocol, no control characters. TanStack Router only routes
 * internally so there's no open-redirect surface, but any XSS-prone
 * route param renderer downstream still benefits from these guards.
 */
const routeSchema = z
  .string()
  .startsWith('/')
  .refine((s) => !s.startsWith('//') && !s.startsWith('/\\'), {
    message: 'protocol-relative or backslash-escaped path',
  })
  // eslint-disable-next-line no-control-regex
  .refine((s) => !/[\x00-\x1f]/.test(s), {
    message: 'control characters not allowed',
  })
  .refine((s) => !/^\/[^/]*:\/\//.test(s), {
    message: 'embedded protocol not allowed',
  });

const shareableStateSchema = z.object({
  route: routeSchema,
  tenant: z.number().optional(),
  time: shareableTimeSchema,
  tags: shareableFlagsSchema,
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
        start: dates.from!,
        end: dates.to!,
      };
  }
};

export const toDatesPayload = (time: ShareableTime): DatesPayload => {
  switch (time.type) {
    case 'all':
      return { type: 'all' };
    case 'auto':
      return { type: 'auto', from: 0, to: Date.now() };
    case 'from':
      return {
        type: 'from',
        from_duration: time.duration,
        from_unit: time.unit,
      };
    case 'range':
      return { type: 'range', from: time.start, to: time.end };
  }
};

export const toFilterInputs = (
  filters: ShareableState['filters'],
): FilterInput[] =>
  filters.map((f) => ({
    key: f.key,
    value: f.value,
    options: {
      ...(f.negated && { isNegated: true }),
      ...(f.wildcarded && { isWildcarded: true }),
    },
  }));

export const buildShareableState = (
  route: string,
  dates: DatesState,
  queryFilters: QueryFilterState[],
  flags: FilterFlags,
  tenant: number | undefined,
): ShareableState => ({
  route,
  ...(tenant !== undefined && { tenant }),
  time: buildTimePayload(dates),
  tags: toSerializedFilterFlags(flags),
  filters: queryFilters
    .filter((f) => !f.isSuspended)
    .map((f) =>
      Object.assign(
        { key: f.key, value: f.value },
        f.isNegated && { negated: true },
        f.isWildcarded && { wildcarded: true },
      ),
    ),
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
