import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';

const forceWildcard = new Set(['content', 'msg']);

type QueryFilterInput = Omit<QueryFilterState, 'id' | 'is_suspended'> & {
  enabled: boolean;
};

export const toFilterDefDto = (f: QueryFilterInput) => ({
  key: f.key,
  value: f.value,
  operator: f.is_negated ? 'different' : 'equal',
  full_string: forceWildcard.has(f.key) ? false : !f.is_wildcarded,
});
