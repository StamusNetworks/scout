import type { PersistedFilter } from '@/features/query-filters/query-filter.model';

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

export type FilterSetCreateInput = {
  name: string;
  page: string;
  share?: 'static' | 'global' | 'private';
  description: string;
  filters: PersistedFilter[];
  tags?: FilterSetTags;
};
