import { useQueryState } from 'nuqs';

export function useFamilyClassParam(
  defaultValue: 'all' | 'compromise' | 'policy_violation' = 'all',
) {
  return useQueryState('type', {
    defaultValue,
  });
}
