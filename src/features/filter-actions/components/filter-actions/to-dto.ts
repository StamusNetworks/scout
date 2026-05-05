import { QueryFilterState } from '@/features/query-filters/model/query-filter';

const forceWildcard = new Set(['content', 'msg']);

type QueryFilterInput = Omit<QueryFilterState, 'id' | 'isSuspended'> & {
  enabled: boolean;
};

export const toFilterDefDto = (f: QueryFilterInput) => ({
  key: f.key,
  value: f.value,
  operator: f.isNegated ? 'different' : 'equal',
  full_string: forceWildcard.has(f.key) ? false : !f.isWildcarded,
});
