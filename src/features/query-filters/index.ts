// Public surface for the query-filters context. Only types, hooks, and
// components live here. Slices, selectors, DTOs, builders, and other
// internals stay private — see docs/architecture.md.

// --- Domain types --------------------------------------------------------

export { qfilterDef, shouldShowWildcard } from './model/query-filter';
export type {
  PersistedFilter,
  QueryFilterDefinition,
  QueryFilterPayload,
  QueryFilterState,
  QueryFilterType,
} from './model/query-filter';

export {
  defaultFilterFlags,
  toFilterFlags,
  toSerializedFilterFlags,
} from './model/filter-flags';
export type {
  AlertTagFlags,
  EventTypeFlags,
  FilterFlags,
  SerializedFilterFlags,
} from './model/filter-flags';

export {
  ES_Types,
  FilterCategory,
  FilterInputType,
  FilterType,
  FilterValidationType,
  KillChainStepsEnum,
} from './definitions/query-filter.config';

export type { MixedQueryFilterDefinitions } from './state/query-filters.selectors';

// --- Hooks ---------------------------------------------------------------

export { useEnableFilterFlags } from './hooks/use-enable-filter-flags';
export { useESMapping } from './hooks/use-es-mapping';
export { useFilterFlagsRepository } from './hooks/use-filter-flags-repository';
export { useQueryFilterDefinition } from './hooks/use-filters-definitions';
export { useGlobalQueryParams } from './hooks/use-global-query-params';
export { useQFBuilder } from './hooks/use-qf-builder';

// State-read hooks (replace cross-feature selector imports)
export {
  useAlertTagFlags,
  useAlertTagFlagsParams,
  useEventTypeFlags,
  useEventTypeFlagsParams,
  useFilterFlags,
  useGatedFilterFlags,
  useNovelty,
  useQueryFilters,
  useQueryTypes,
} from './hooks/use-query-filters';

// Modal hook
export { useQfilterModal } from './hooks/use-qfilter-modal';

// Primitive dispatchers
export { useClearQueryFilters } from './hooks/use-clear-query-filters';
export { useSetQueryFilters } from './hooks/use-set-query-filters';

// Action hooks (compose primitives + suspension/dedup rules)
export { useCreateFilter } from './hooks/use-create-filter';
export { useDeleteFilter } from './hooks/use-delete-filter';
export { useHardReplaceFilters } from './hooks/use-hard-replace-filters';
export { useListFilters } from './hooks/use-list-filters';
export { useReorderFilters } from './hooks/use-reorder-filters';
export { useSoftReplaceFilters } from './hooks/use-soft-replace-filters';
export { useSuspendFilter } from './hooks/use-suspend-filter';
export { useUpdateFilter } from './hooks/use-update-filter';
export { useUpsertFilterByRole } from './hooks/use-upsert-filter-by-role';

// Build hooks (compose state + builders)
export { useBuildEventsQfilter } from './hooks/use-build-events-qfilter';
export { useBuildHostIdQfilter } from './hooks/use-build-host-id-qfilter';
export { useBuildSignatureFilter } from './hooks/use-build-signature-params';

// --- Components ----------------------------------------------------------

export { AddQfilterCommand } from './components/add-qfilter-command/add-qfilter-command';
export { AddEsFilterModal } from './components/add-qfilter-modal/add-es-filter.modal';
export { FilterInput } from './components/edit-qfilter-modal/filter-input';
export {
  FiltersSideBar,
  SideBarHeader,
} from './components/filters-sidebar/filters-sidebar';
export { EventValue } from './components/interactive-value/event-value';
