// Public surface for the query-filters context. Only types, hooks, and
// components live here. Slices, selectors, DTOs, builders, and other
// internals stay private — see docs/architecture.md.

// --- Domain types --------------------------------------------------------

export type {
  PersistedFilter,
  QueryFilterDefinition,
  QueryFilterPayload,
  QueryFilterState,
  QueryFilterType,
} from './model/query-filter';
export { qfilterDef, shouldShowWildcard } from './model/query-filter';

export type {
  AlertTagFlags,
  EventTypeFlags,
  FilterFlags,
  SerializedFilterFlags,
} from './model/filter-flags';
export {
  defaultFilterFlags,
  toFilterFlags,
  toSerializedFilterFlags,
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

export { useGlobalQueryParams } from './hooks/use-global-query-params';
export { useESMapping } from './hooks/use-es-mapping';
export { enableTags, useEnableTags } from './hooks/use-enable-tags';
export { useTagFiltersRepository } from './hooks/use-tag-filters';
export { useQueryFiltersRepository } from './state/query-filters.repository';
export { useQFBuilder } from './hooks/use-qf-builder';
export { useQueryFilterDefinition } from './hooks/use-filters-definitions';

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
} from './hooks/use-query-filters';

// Action hooks
export { useClearFilters } from './hooks/use-clear-filters';
export { useCreateFilter } from './hooks/use-create-filter';
export { useDeleteFilter } from './hooks/use-delete-filter';
export { useListFilters } from './hooks/use-list-filters';
export { useReorderFilters } from './hooks/use-reorder-filters';
export { useReplaceFilters } from './hooks/use-replace-filters';
export { useSuspendFilter } from './hooks/use-suspend-filter';
export { useUpdateFilter } from './hooks/use-update-filter';
export { useUpsertFilterByRole } from './hooks/use-upsert-filter-by-role';

// Build hooks (compose state + builders)
export { useBuildEventsQfilter } from './hooks/use-build-events-qfilter';
export { useBuildHostIdQfilter } from './hooks/use-build-host-id-qfilter';
export { useBuildSignatureFilter } from './hooks/use-build-signature-params';

// --- Components ----------------------------------------------------------

export {
  FiltersSideBar,
  SideBarHeader,
} from './components/filters-sidebar/filters-sidebar';
export { EventValue } from './components/interactive-value/event-value';
export { FilterInput } from './components/edit-qfilter-modal/filter-input';
export { AddEsFilterModal } from './components/add-qfilter-modal/add-es-filter.modal';
export { AddQfilterCommand } from './components/add-qfilter-command/add-qfilter-command';
