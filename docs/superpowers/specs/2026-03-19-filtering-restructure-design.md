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
│   ├── dates.model.ts
│   ├── dates.repository.ts
│   ├── dates.store.ts
│   ├── dates.selectors.ts
│   ├── dates.api.ts
│   ├── dates.utils.ts
│   └── use-cases/
│       ├── set-dates/
│       │   └── set-dates.ts
│       └── auto-range/
│           └── use-auto-range.ts
│
├── tenant/
│   └── tenant.repository.ts
│
├── filters/
│   ├── tag-filters/
│   │   ├── tag-filters.model.ts
│   │   ├── tag-filters.repository.ts
│   │   └── use-cases/
│   │       └── update-tag-filters/
│   │           └── update-tag-filters.ts
│   │
│   └── query-filters/
│       ├── query-filter.model.ts
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
│       │   └── filter-mapper.ts
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
│           │   └── filter-input.tsx
│           ├── delete-filter/
│           │   └── delete-filter.ts
│           ├── suspend-filter/
│           │   └── suspend-filter.ts
│           ├── clear-filters/
│           │   └── clear-filters.ts
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
    ├── filterset.model.ts
    ├── filtersets.repository.ts
    ├── filtersets.store.ts
    ├── filtersets.api.ts
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
  setLoadedId(id: number | null): void;
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

The `loaded` reset (clearing loaded filter set ID on any filter change) moves to the use-case services that modify filters.

### dates.store.ts and filtersets.store.ts

Unchanged internally — they're already simple enough. Just renamed/moved.

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
