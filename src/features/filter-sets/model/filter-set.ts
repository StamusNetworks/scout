import type { PersistedFilter } from '@/features/query-filters/model/query-filter';

/**
 * Domain shape for filter-set tags. Aligned with the live query-filters
 * flag domain (`alert`/`discovery`/`stamus`), unlike the wire which
 * uses `alerts`/`sightings`. Filter-sets do not persist `novelty`.
 */
export type FilterSetTags = {
  stamus: boolean;
  alert: boolean;
  discovery: boolean;
  informational: boolean;
  relevant: boolean;
  untagged: boolean;
};

/**
 * Domain shape for a saved filter set. The wire's `content` mixed
 * array is split here into `filters` and the optional `tags` object.
 */
export type FilterSet = {
  id: number;
  name: string;
  description: string;
  page: string;
  imported: boolean;
  share?: 'static' | 'global' | 'private';
  filters: PersistedFilter[];
  tags?: FilterSetTags;
};

/**
 * What the create form / save dialog provides for each filter. The
 * wire fields (`fullString`, `negated`, `id`) are derived in the ACL
 * transform — the input layer speaks domain language.
 */
export type FilterSetFilterInput = {
  key: string;
  value: string | number;
  is_negated?: boolean;
  is_wildcarded?: boolean;
};

export type FilterSetCreateInput = {
  name: string;
  page: string;
  share?: 'static' | 'global' | 'private';
  description: string;
  filters: FilterSetFilterInput[];
  tags?: FilterSetTags;
};
