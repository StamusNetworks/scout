// Public surface for the filter-sets context. Only types, hooks, and
// components live here. Slices, selectors, DTOs, transforms, and other
// internals stay private — see docs/architecture.md.

// --- Domain types --------------------------------------------------------

export type {
  FilterSet,
  FilterSetCreateInput,
  FilterSetTags,
} from './model/filter-set';

export { filterSetPageConfig } from './definitions/filter-sets.constants';

// --- Hooks ---------------------------------------------------------------

export {
  useCreateFilterSetMutation,
  useDeleteFilterSetMutation,
  useGetFilterSetsQuery,
} from './api/filter-sets.api';

export { useFilterSetsRepository } from './state/filter-sets.repository';
export { useIsLoadedFilterSet } from './state/filter-sets.slice';
export { useLoadFilterSet } from './hooks/use-load-filter-set';
export { useSaveFilterSetModal } from './hooks/use-save-filter-set-modal';

// --- Components ----------------------------------------------------------

export { FilterSetsView } from './components/filter-sets-view/filter-sets-view';
export { SaveFilterSetModal } from './components/save-filter-set-dialog/save-filter-set.dialog';
export { SideBarQueryFilterSets } from './components/sidebar-filter-sets/sidebar-filter-sets';
