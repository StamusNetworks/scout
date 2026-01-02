import { z } from 'zod';

import {
  EVENT_TYPES,
  FilterCategory,
  FilterInputType,
  FilterType,
  FilterValidationType,
} from '../constants/query-filter.config';

export type EventTypes = typeof EVENT_TYPES;
export type FilterValidationType = typeof FilterValidationType;
export type FilterInputType = typeof FilterInputType;
export type FilterType = typeof FilterType;

type SelectFilter = {
  inputType: FilterInputType['SELECT'];
  options: Array<{ value: string; label: string }>;
};
type NumberFilter = {
  inputType: FilterInputType['NUMBER'];
};
type TextFilter = {
  inputType?: FilterInputType['TEXT'];
};

export type QueryFilterDefinition = {
  label: string; // ex: Source IP
  key: string; // ex: sourceIp - Serves to identify a filter
  category: FilterCategory; // Group filters together, host_id, signatures, event etc
  convertible?: string[];
  // INFOS
  entity?: FilterType[keyof FilterType] | FilterType[keyof FilterType][]; // ex: Type of entity, allows for auto conversion, ex: IP
  validationType?: FilterValidationType[keyof FilterValidationType];
  toQFString?: ({
    key,
    value,
    keyword,
    negated,
    wildcarded,
  }: {
    key?: string;
    value: string | number;
    keyword?: string;
    negated?: boolean;
    wildcarded?: boolean;
  }) => string; // A function to format the qfilter value
  toDisplayValue?: ((value: string) => string) | ((value: number) => string);
  toQueryValue?: ((value: string) => string) | ((value: number) => string);
  type?:
    | 'text'
    | 'keyword'
    | 'long'
    | 'double'
    | 'ip'
    | 'boolean'
    | 'float'
    | 'half_float'
    | 'date'
    | 'geo_point';
} & (SelectFilter | NumberFilter | TextFilter);

export type QueryFilterPayload = Partial<QueryFilterState>;

export type QueryFilterState = {
  id: string; // uuidv4: 10121e1a-c0e9-4d2a-a0a3-b0c4e0d0f0g0
  key: string; // signature.message
  value: string | number;
  is_suspended: boolean;
  is_negated: boolean;
  is_wildcarded: boolean;
  role?: string;
};

export const qfilterDef = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  negated: z.boolean(),
  fullString: z.boolean(),
  query: z.string().optional(),
});

export const QueryMatching = {
  exact: {
    label: 'Exact',
    toQFString: ({
      key,
      value,
      keyword,
      negated,
    }: {
      key: string;
      value: string | number;
      keyword: string;
      negated?: boolean;
    }) => `${negated ? 'NOT ' : ''}${key}.${keyword}:"${value}"`,
  },
  substring: {
    toQFString: ({
      key,
      value,
      negated,
    }: {
      key: string;
      value: string | number;
      keyword: string;
      negated?: boolean;
    }) => `${negated ? 'NOT ' : ''}${key}:"${value}"`,
  },
  word: {
    label: 'Word',
    toQFString: ({
      key,
      value,
      negated,
    }: {
      key: string;
      value: string | number;
      negated?: boolean;
    }) => `${negated ? 'NOT ' : ''}${key}:${value}`,
  },
};
export type QueryMatching = keyof typeof QueryMatching;

export const QueryFilterType: Record<
  string,
  {
    match: ('exact' | 'word' | 'substring')[];
  }
> = {
  date: {
    match: ['exact', 'word'],
  },
  keyword: {
    match: ['exact'],
  },
  text: {
    match: ['exact', 'word'],
  },
  ip: {
    match: ['substring'],
  },
  boolean: {
    match: ['word'],
  },
  float: {
    match: ['word'],
  },
  long: {
    match: ['word'],
  },
  half_float: {
    match: ['word'],
  },
  geo_point: {
    match: ['word'],
  },
  double: {
    match: ['word'],
  },
} as const;
export type QueryFilterType = keyof typeof QueryFilterType;

export const shouldShowWildcard = (type: string) =>
  QueryFilterType[type]?.match.length > 1;
