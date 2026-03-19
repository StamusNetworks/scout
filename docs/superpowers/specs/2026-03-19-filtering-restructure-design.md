# Filtering Feature Restructure — Design Spec

> **Goal:** Restructure `src/features/filtering/` into clean architecture with repository pattern, use-case services, and colocated UI components. No behavior changes — this is a folder layout + abstraction layer restructure.

**Architecture:** Repositories are React hooks wrapping Redux slices as dumb read/write adapters. Use-case services are hooks that compose repositories with business logic. UI components live inside their relevant use-case folders. The repository interface enables future storage swaps (e.g., URL search params) without touching use-cases or UI.

**Tech Stack:** Redux Toolkit, RTK Query, React 19, Zod, vitest, react-testing-library.

---

## Current State

Three Redux slices under `src/features/filtering/`:

- **`query-filters/`** — `queryFilters[]` (active filters), `tagFilters` (novelty, alert tags, event types), `types` (ES mapping). Business logic (suspension, wildcard, dedup) is in the slice reducers.
- **`query-filters-sets/`** — `loaded` (current set ID), `favorites[]`, `pinned[]`. Persisted via backend API.
- **`dates-filters/`** — `start_date`, `end_date`, `type`, `from_duration`, `from_unit`. Persisted to localStorage.

No repository abstraction. Components dispatch directly to slices. 133+ consumers across the codebase import from `filtering/`.

---

## Target Structure

```
src/features/filtering/
├── use-global-query-params.ts
│
├── dates/
│   ├── dates.model.ts                      # DatesState, DatesPayload, TimeUnit, UNITS_IN_MILLISECONDS
│   ├── dates.repository.ts
│   ├── dates.store.ts
│   ├── dates.selectors.ts                  # selectDates, computeDates, selectIsAfterStart
│   ├── dates.api.ts                        # RTK Query: getAutoDateRange
│   ├── dates.utils.ts                      # getPersistedDates, persistDates
│   └── use-cases/
│       ├── set-dates/
│       │   └── set-dates.ts
│       ├── auto-range/
│       │   └── use-auto-range.ts
│       └── previous-dates/
│           └── use-previous-dates.ts       # usePreviousDates hook
│
├── tenant/
│   └── tenant.repository.ts                # re-exports selectTenant from features/user/tenancy/
│
├── filters/
│   ├── tag-filters/
│   │   ├── tag-filters.model.ts            # TagFilters, AlertTags, EventTypes, Novelty
│   │   ├── tag-filters.repository.ts
│   │   └── use-cases/
│   │       └── update-tag-filters/
│   │           └── update-tag-filters.ts
│   │
│   └── query-filters/
│       ├── query-filter.model.ts           # QueryFilterState, QueryFilterDefinition, PersistedFilter, etc.
│       ├── query-filters.repository.ts
│       ├── query-filters.store.ts
│       ├── query-filters.icons.tsx
│       ├── constants/
│       │   ├── query-filter.config.ts
│       │   ├── query-filter.definition.tsx
│       │   └── query-filtersets.ts
│       ├── utils/
│       │   ├── qf-builder.ts
│       │   ├── entity-validators.ts
│       │   ├── filter-mapper.ts            # FilterInput type
│       │   ├── get-filter-label.ts         # getFilterLabel, getFilterValue
│       │   └── suspension-rules.ts         # applySuspensionRules, applyDeduplication (extracted from slice)
│       ├── hooks/
│       │   ├── use-qf-builder.ts
│       │   └── use-filters-definitions.ts
│       └── use-cases/
│           ├── create-filter/
│           │   ├── create-filter.ts
│           │   ├── add-qfilter-command.tsx
│           │   ├── add-qfilter-command.slice.ts
│           │   ├── add-qfilter-command.selectors.ts
│           │   ├── add-qfilter-command.slice.test.ts
│           │   ├── filter-options.tsx
│           │   ├── operator-options.tsx
│           │   ├── values-options.tsx
│           │   └── add-es-filter.modal.tsx
│           ├── update-filter/
│           │   ├── update-filter.ts
│           │   ├── edit-filter.modal.tsx
│           │   ├── edit-qfilter-form.tsx
│           │   └── filter-input.tsx         # FilterInput component (was filters-input.tsx)
│           ├── delete-filter/
│           │   └── delete-filter.ts
│           ├── suspend-filter/
│           │   └── suspend-filter.ts
│           ├── clear-filters/
│           │   └── clear-filters.ts
│           ├── replace-filters/
│           │   └── replace-filters.ts       # useReplaceFilters (11 consumers: share, investigation, etc.)
│           ├── upsert-filter-by-role/
│           │   └── upsert-filter-by-role.ts # useUpsertFilterByRole (NetworkTreeFilterService)
│           ├── reorder-filters/
│           │   └── reorder-filters.ts       # useReorderFilters (drag-and-drop in sidebar)
│           ├── list-filters/
│           │   ├── list-filters.ts
│           │   ├── filters-sidebar.tsx
│           │   ├── sidebar-query-filter.tsx
│           │   ├── sidebar-filter.tsx
│           │   ├── filter-label.tsx
│           │   └── event-field.tsx
│           ├── interactive-value/
│           │   ├── event-value.tsx
│           │   ├── event-value.test.tsx
│           │   └── context-menu/
│           │       ├── context-menu.content.tsx
│           │       └── options/
│           │           ├── mitre.tsx
│           │           ├── threat-family-name.tsx
│           │           └── threat-name.tsx
│           ├── build-qfilter/
│           │   └── build-qfilter.ts
│           ├── build-host-id-qfilter/
│           │   └── build-host-id-qfilter.ts
│           └── build-signature-filter/
│               ├── build-signature-filter.ts
│               └── build-signature-filter.test.ts
│
└── filtersets/
    ├── filterset.model.ts                   # QueryFilterSet, queryFilterSetCreatePayload, getTagsFromFilterSet, etc.
    ├── filtersets.repository.ts
    ├── filtersets.store.ts
    ├── filtersets.api.ts                    # RTK Query: getFilterSets, createFilterSet, deleteFilterSet
    └── use-cases/
        ├── load-filter-set/
        │   └── load-filter-set.ts
        ├── save-filter-set/
        │   ├── save-filter-set.ts
        │   ├── save-filterset.dialog.tsx
        │   ├── save-filterset.form.tsx
        │   └── save-filterset.slice.ts
        ├── delete-filter-set/
        │   ├── delete-filter-set.ts
        │   └── delete-filter-set-confirmation.tsx
        ├── list-filter-sets/
        │   ├── filter-sets-view.tsx
        │   └── filter-sets-view.test.tsx
        └── pinned-filter-sets/
            ├── sidebar-query-filter-sets.tsx
            └── sidebar-query-filter-sets.molecules.tsx
```

---

## Repository Interfaces

Repositories are React hooks that wrap Redux slices as dumb read/write adapters. They contain no business logic — only state access and mutations.

### QueryFiltersRepository

```ts
// src/features/filtering/filters/query-filters/query-filters.repository.ts

type QueryFiltersRepository = {
  getAll(): QueryFilterState[];
  getTypes(): Record<string, { type: QueryFilterType }> | undefined;
  set(filters: QueryFilterState[]): void;
  clear(): void;
};

function useQueryFiltersRepository(): QueryFiltersRepository {
  const filters = useAppSelector(selectRawQueryFilters);
  const types = useAppSelector(selectTypes);
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    getAll: () => filters,
    getTypes: () => types,
    set: (filters) => dispatch(setQueryFilters(filters)),
    clear: () => dispatch(clearQueryFilters()),
  }), [filters, types, dispatch]);
}
```

### TagFiltersRepository

```ts
// src/features/filtering/filters/tag-filters/tag-filters.repository.ts

type TagFiltersRepository = {
  getAll(): TagFilters;
  set(tags: Partial<TagFilters>): void;
};

function useTagFiltersRepository(): TagFiltersRepository {
  const tags = useAppSelector(selectTagFilters);
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    getAll: () => tags,
    set: (tags) => dispatch(setTagFilters(tags)),
  }), [tags, dispatch]);
}
```

### DatesRepository

```ts
// src/features/filtering/dates/dates.repository.ts

type DatesRepository = {
  getAll(): DatesState;
  set(payload: DatesPayload): void;
  refresh(): void;
};

function useDatesRepository(): DatesRepository {
  const dates = useAppSelector(selectDates);
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    getAll: () => dates,
    set: (payload) => dispatch(setDates(payload)),
    refresh: () => dispatch(refreshRange()),
  }), [dates, dispatch]);
}
```

### FilterSetsRepository

```ts
// src/features/filtering/filtersets/filtersets.repository.ts

type FilterSetsRepository = {
  getLoadedId(): number | null;
  getFavorites(): QueryFilterSet[];
  getPinned(): QueryFilterSet[];
  setLoadedId(id: number): void;
  addToCollection(key: 'favorites' | 'pinned', sets: QueryFilterSet[]): void;
  removeFromCollection(key: 'favorites' | 'pinned', id: number): void;
  clearCollection(key: 'favorites' | 'pinned'): void;
};

function useFilterSetsRepository(): FilterSetsRepository {
  const loadedId = useAppSelector(selectLoadedFilterSetId);
  const favorites = useAppSelector(selectFavorites);
  const pinned = useAppSelector(selectPinned);
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    getLoadedId: () => loadedId,
    getFavorites: () => favorites,
    getPinned: () => pinned,
    setLoadedId: (id) => dispatch(setLoadedFilterSetId(id)),
    addToCollection: (key, sets) => dispatch(addQueryFilterSets({ key, sets })),
    removeFromCollection: (key, id) => dispatch(removeQueryFilterSet({ key, id })),
    clearCollection: (key) => dispatch(clearQueryFilterSets(key)),
  }), [loadedId, favorites, pinned, dispatch]);
}
```

### TenantRepository

```ts
// src/features/filtering/tenant/tenant.repository.ts

type TenantRepository = {
  get(): number | undefined;
};

function useTenantRepository(): TenantRepository {
  const tenant = useAppSelector(selectTenant);
  return useMemo(() => ({
    get: () => tenant,
  }), [tenant]);
}
```

---

## Use-Case Services

Use-case services are React hooks that compose repositories with business logic. They return action functions or derived state.

### create-filter

```ts
// src/features/filtering/filters/query-filters/use-cases/create-filter/create-filter.ts

function useCreateFilter(): (input: FilterInput) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback((input: FilterInput) => {
    const filters = repo.getAll();
    const newFilter = qfBuilder.createFilter(input.key, input.value, input.options);

    // Business logic: suspension rules, duplicate detection
    const updated = applySuspensionRules(filters, newFilter, input.key);
    const deduped = applyDeduplication(updated, newFilter, input);

    repo.set(deduped);
    showFilterToast('added', input);
  }, [repo, qfBuilder]);
}
```

Extracted pure functions:
- `applySuspensionRules(filters, newFilter, key)` — sibling suspension logic (currently in slice)
- `applyDeduplication(filters, newFilter, input)` — duplicate detection (currently in slice)

These are testable without Redux.

### update-filter

```ts
function useUpdateFilter(): (filter: QueryFilterState) => void {
  const repo = useQueryFiltersRepository();

  return useCallback((update: QueryFilterState) => {
    const filters = repo.getAll();
    const updated = applyUpdateWithSuspension(filters, update);
    repo.set(updated);
    showFilterToast('updated', update);
  }, [repo]);
}
```

### delete-filter

```ts
function useDeleteFilter(): (filterId: string) => void {
  const repo = useQueryFiltersRepository();

  return useCallback((filterId: string) => {
    const filters = repo.getAll();
    const target = filters.find(f => f.id === filterId);
    repo.set(filters.filter(f => f.id !== filterId));
    if (target) showFilterToast('deleted', target);
  }, [repo]);
}
```

### suspend-filter

```ts
function useSuspendFilter(): {
  toggle: (filterId: string) => void;
  suspendMany: (predicate: (f: QueryFilterState) => boolean) => void;
  clearSuspended: () => void;
} {
  const repo = useQueryFiltersRepository();

  return useMemo(() => ({
    toggle: (filterId) => {
      const filters = repo.getAll();
      const updated = applyToggleSuspension(filters, filterId);
      repo.set(updated);
    },
    suspendMany: (predicate) => {
      const filters = repo.getAll();
      repo.set(filters.map(f => predicate(f) ? { ...f, is_suspended: true } : f));
    },
    clearSuspended: () => {
      const filters = repo.getAll();
      repo.set(filters.filter(f => !f.is_suspended));
      toast.success('Cleared suspended filters');
    },
  }), [repo]);
}
```

### clear-filters

```ts
function useClearFilters(): () => void {
  const repo = useQueryFiltersRepository();
  return useCallback(() => {
    repo.clear();
    toast.success('Cleared all filters');
  }, [repo]);
}
```

### list-filters

```ts
function useListFilters(): {
  all: QueryFilterState[];
  active: QueryFilterState[];
  suspended: QueryFilterState[];
} {
  const repo = useQueryFiltersRepository();
  const filters = repo.getAll();

  return useMemo(() => ({
    all: filters,
    active: filters.filter(f => !f.is_suspended),
    suspended: filters.filter(f => f.is_suspended),
  }), [filters]);
}
```

### build-qfilter

```ts
function useBuildEventsQfilter(
  extension?: QueryFilterState[] | string,
  options?: { tags: boolean },
): string | undefined {
  const repo = useQueryFiltersRepository();
  const tagRepo = useTagFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);

  // Compose: active event-category filters + tags + novelty + investigation → ES string
  // Replaces selectEventsQfilter selector
}
```

### build-host-id-qfilter

```ts
function useBuildHostIdQfilter(
  extra?: QueryFilterState[],
  blacklist?: string[],
): string | undefined {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);

  // Compose: host_id.* filters → ES string
  // Replaces selectHostIDQFilter selector
}
```

### build-signature-filter

```ts
function useBuildSignatureFilter(
  extra?: QueryFilterState[],
): SignatureFilters | undefined {
  const repo = useQueryFiltersRepository();
  // Compose: signature-category filters → { content, msg, hits_min, hits_max }
  // Replaces selectSignatureFilters selector
}
```

### update-tag-filters

```ts
function useUpdateTagFilters(): {
  update: (tags: Partial<TagFilters>) => void;
  enableDefaults: (overrides?: Partial<TagFilters>) => void;
} {
  const repo = useTagFiltersRepository();

  return useMemo(() => ({
    update: (tags) => repo.set(tags),
    enableDefaults: (overrides) => repo.set({ ...DEFAULT_TAGS, ...overrides }),
  }), [repo]);
}
```

### replace-filters

Replaces all current filters with a new set. Used by URL share hydration, investigation, operational center, and others (11 consumers).

```ts
function useReplaceFilters(): (newFilters: FilterInput[] | QueryFilterState[]) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback((newFilters) => {
    const current = repo.getAll();
    // Suspend all existing, then match or create new ones
    const result = applyReplaceLogic(current, newFilters, qfBuilder);
    repo.set(result);
  }, [repo, qfBuilder]);
}
```

The `applyReplaceLogic` pure function encapsulates the current `replaceFilters` reducer logic: suspend all existing filters, then for each new filter, either un-suspend a matching existing filter or create a new one.

### upsert-filter-by-role

Create or update a filter identified by its `role` field. Used by `NetworkTreeFilterService`.

```ts
function useUpsertFilterByRole(): (input: FilterInput) => void {
  const repo = useQueryFiltersRepository();
  const qfBuilder = useQFBuilder();

  return useCallback((input) => {
    const filters = repo.getAll();
    const result = applyUpsertByRole(filters, input, qfBuilder);
    repo.set(result);
  }, [repo, qfBuilder]);
}
```

### reorder-filters

Drag-and-drop reordering of filters in the sidebar.

```ts
function useReorderFilters(): (reordered: QueryFilterState[]) => void {
  const repo = useQueryFiltersRepository();

  return useCallback((reordered) => {
    repo.set(reordered);
  }, [repo]);
}
```

### load-filter-set

```ts
function useLoadFilterSet(): (filterSet: QueryFilterSet) => void {
  const queryRepo = useQueryFiltersRepository();
  const tagRepo = useTagFiltersRepository();
  const setsRepo = useFilterSetsRepository();

  return useCallback((filterSet) => {
    if (setsRepo.getLoadedId() === filterSet.id) return;

    queryRepo.clear();
    const tags = getTagsFromFilterSet(filterSet);
    if (tags) tagRepo.set(mapFilterSetTags(tags));

    const filters = getFiltersFromFilterSet(filterSet);
    // Create each filter via QFBuilder and set
    queryRepo.set(filters.map(f => createFromPersistedFilter(f)));
    setsRepo.setLoadedId(filterSet.id);
    toast.success('Filterset applied');
  }, [queryRepo, tagRepo, setsRepo]);
}
```

---

## Design Decisions & Constraints

### Loaded filter set ID reset

Currently the `query-filters-sets` slice uses `extraReducers` to listen to 8 query-filter actions and reset `loaded = null`. In the new architecture, the simplified slice only has `setQueryFilters` and `clearQueryFilters`. The `filtersets.store.ts` slice keeps an `extraReducer` on `setQueryFilters` and `clearQueryFilters` to automatically reset `loaded = null`. This preserves the behavior without requiring every use-case to manually call `setsRepo.setLoadedId(null)`.

```ts
// filtersets.store.ts extraReducers:
builder.addCase(setQueryFilters, (state) => { state.loaded = null; });
builder.addCase(clearQueryFilters, (state) => { state.loaded = null; });
builder.addCase(setTagFilters, (state) => { state.loaded = null; });
```

### Imperative (non-React) consumers

Two consumers dispatch outside React component context:
- `NetworkTreeFilterService` — uses `store.dispatch()` directly
- Current `loadFilterSet` — uses `store.getState()` and `store.dispatch()`

**Strategy:** These remain as imperative functions that import the simplified slice actions directly (`setQueryFilters`, `clearQueryFilters`). They bypass the repository/use-case hooks since they run outside React. When storage is later migrated to URL params, these will need to be refactored into React hooks. For now, they keep working via direct store access and the simplified slice actions.

The `NetworkTreeFilterService` should extract the suspension + upsert logic into the same pure functions (`applyUpsertByRole`) used by the `useUpsertFilterByRole` hook, so the business logic is shared even though the storage access differs.

### Enterprise vs CE filter definitions

The current `selectTagFilters` returns `null` when not enterprise, and `selectQueryFiltersDefinitions` switches between `QueryFiltersRecord` and `CEQueryFiltersRecord`. This gating stays in the selectors/hooks layer (`use-filters-definitions.ts`, `use-qf-builder.ts`) — the repositories don't need to know about enterprise vs CE. The `useQFBuilder` hook already handles this correctly.

### Stale closure constraint

Repository methods returned via `useMemo` capture state at render time. Use-case services must call `repo.set()` once with the final computed state — never in a loop where intermediate updates would be lost. This matches the current pattern where each reducer produces one final state.

### Toast side effects

Toast calls (`toast.success(...)`) move from slice reducers into use-case services. A shared `showFilterToast(action, filter)` helper handles label lookup via `getFilterLabel` and consistent messaging:

```ts
function showFilterToast(action: 'added' | 'updated' | 'deleted', filter: { key: string; value: string | number }) {
  const label = getFilterLabel(filter.key);
  toast.success(`${label} filter ${action}`, { description: `value: ${filter.value}` });
}
```

### Investigation filter injection in build-qfilter

The `useBuildEventsQfilter` use-case must preserve the investigation stages logic from current `useGlobalQueryParams`:

```ts
// For each investigation stage, create es_filter entries with OR-joined values:
investigation.stages.forEach((stage) => {
  extension.push(
    qfBuilder.createFilter(
      'es_filter',
      stage.values.map((v) => `${stage.key}:"${esEscape(v)}"`).join(' OR '),
    ),
  );
});
```

The `extension` parameter also supports `string` type (concatenated with " AND ") for backward compatibility. Both variants must be preserved.

---

## Store Changes

### query-filters.store.ts (simplified)

The slice becomes a dumb CRUD store. Business logic (suspension rules, wildcard enforcement, duplicate detection, toasts) moves to use-case services.

```ts
const queryFiltersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
      state.queryFilters = action.payload;
    },
    clearQueryFilters: (state) => {
      state.queryFilters = [];
    },
    setTagFilters: (state, action: PayloadAction<Partial<TagFilters>>) => {
      Object.assign(state.tagFilters, action.payload);
    },
  },
  extraReducers: (builder) => {
    // ES mapping types from SettingsAPI — unchanged
    builder.addMatcher(
      SettingsAPI.endpoints.getESMapping.matchFulfilled,
      (state, action) => { /* same as current */ },
    );
  },
});
```

All the individual action creators (`addQueryFilter`, `updateQueryFilter`, `deleteQueryFilter`, `suspendQueryFilter`, etc.) are removed. The slice only exposes `setQueryFilters`, `clearQueryFilters`, and `setTagFilters`.

### filtersets.store.ts

Unchanged internally, plus `extraReducers` listening to the simplified query-filters actions to reset `loaded`:

```ts
extraReducers: (builder) => {
  builder.addCase(setQueryFilters, (state) => { state.loaded = null; });
  builder.addCase(clearQueryFilters, (state) => { state.loaded = null; });
  builder.addCase(setTagFilters, (state) => { state.loaded = null; });
},
```

The `setLoadedFilterSetId` reducer accepts `PayloadAction<number>` (not `number | null`). The `loaded` field is only set to `null` automatically via `extraReducers`. The repository's `setLoadedId` type matches: `setLoadedId(id: number): void`.

### dates.store.ts

Unchanged internally. Just renamed/moved.

---

## useGlobalQueryParams Migration

The hook at `src/common/fetching/useQueryParams.tsx` moves to `src/features/filtering/use-global-query-params.ts` and is rewritten to use the build use-cases:

```ts
function useGlobalQueryParams(
  subscribe?: SubscribeKey[],
  options?: { extendQfilter?: QueryFilterState[] },
) {
  const dates = useDatesRepository();
  const tenant = useTenantRepository();
  const qfilter = useBuildEventsQfilter(options?.extendQfilter);
  const hostIdQfilter = useBuildHostIdQfilter(options?.extendQfilter);
  const signatureFilters = useBuildSignatureFilter(options?.extendQfilter);
  const computedDates = computeDates(dates.getAll());

  return {
    ...(subscribe?.includes('dates') && computedDates),
    ...(subscribe?.includes('qfilter') && { qfilter, ...eventsTypes }),
    ...(subscribe?.includes('qfilterHost') && { host_id_qfilter: hostIdQfilter }),
    ...(subscribe?.includes('qfilterSignature') && signatureFilters),
    ...(subscribe?.includes('tenant') && { tenant: tenant.get() }),
  };
}
```

The old file at `src/common/fetching/useQueryParams.tsx` is deleted. All 102 consumers update their import path.

---

## Migration Strategy

This is a restructure, not a rewrite. The approach:

1. **Create new folder structure** with repository interfaces and use-case service stubs
2. **Move files** to their new locations, updating imports
3. **Extract business logic** from slice reducers into pure functions used by use-case services
4. **Simplify the slice** to dumb CRUD
5. **Wire use-case services** to use repositories instead of direct dispatch
6. **Update consumers** to import from new paths
7. **Move useGlobalQueryParams** from `common/fetching/` to `filtering/`
8. **Delete old files**

Each step should be independently committable and the app should work at every step.

---

## What Does NOT Change

- Redux store shape (same keys, same state structure)
- RTK Query endpoints
- Component behavior and rendering
- `QFBuilder` factory function (pure, stays as-is)
- Filter definitions (400+ definitions file stays as-is)
- Test behavior (tests move but assertions don't change)
- Any external consumer's behavior (they get the same data)

---

## Testing Strategy

- **Repository hooks:** Test with `renderHook` + Redux provider, verify they read/write slice state
- **Use-case services:** Test with `renderHook` + mocked repository hooks. This is the main win — business logic (suspension rules, dedup, wildcard enforcement) becomes testable without Redux setup
- **Extracted pure functions:** Unit test `applySuspensionRules`, `applyDeduplication`, `applyToggleSuspension` directly
- **Existing tests:** Move to new locations, update imports, verify they still pass

### Test File Mapping

| Current Location | New Location |
|---|---|
| `query-filters/store/query-filters.slice.test.ts` | Split: pure function tests → `utils/suspension-rules.test.ts`, store CRUD → `query-filters.store.test.ts` |
| `query-filters/store/query-filters.selector.test.ts` | `query-filters/use-cases/build-qfilter/build-qfilter.test.ts` (selector logic moves to use-cases) |
| `query-filters/components/add-qfilter-command/add-qfilter-command.slice.test.ts` | `query-filters/use-cases/create-filter/add-qfilter-command.slice.test.ts` |
| `query-filters/utils/build-signature-filters.test.ts` | `query-filters/use-cases/build-signature-filter/build-signature-filter.test.ts` |
| `query-filters/utils/entity-validators.test.ts` | `query-filters/utils/entity-validators.test.ts` (stays in utils) |
| `query-filters/utils/qf-builder.test.ts` | `query-filters/utils/qf-builder.test.ts` (stays in utils) |
| `query-filters/components/event-value/event-value.test.tsx` | `query-filters/use-cases/interactive-value/event-value.test.tsx` |
| `query-filters/entities/filter-sets-view.test.tsx` | `filtersets/use-cases/list-filter-sets/filter-sets-view.test.tsx` |
