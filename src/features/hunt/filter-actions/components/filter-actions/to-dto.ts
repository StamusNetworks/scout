import { QueryFilterState } from '@/features/filtering/query-filters/model/query-filter';

const forceWildcard = ['content', 'msg'];

type QueryFilterInput = Omit<QueryFilterState, 'id' | 'is_suspended'> & {
  enabled: boolean;
};

export const toFilterDefDto = (f: QueryFilterInput) => ({
  key: f.key,
  value: f.value,
  operator: f.is_negated ? 'different' : 'equal',
  full_string: forceWildcard.includes(f.key) ? false : !f.is_wildcarded,
});
