import {
  useCreateFilterSetMutation,
  useDeleteFilterSetMutation,
  useGetFilterSetsQuery,
} from '../api/filter-sets.api';

/**
 * Domain wrappers around the RTK Query endpoints. Public surface is
 * these hooks — the raw RTK hooks live behind the `api/` boundary
 * per docs/architecture.md §2.
 */

export const useFilterSets = () => useGetFilterSetsQuery();

export const useCreateFilterSet = useCreateFilterSetMutation;

export const useDeleteFilterSet = useDeleteFilterSetMutation;
