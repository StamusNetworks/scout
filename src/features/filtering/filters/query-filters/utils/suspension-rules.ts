import type { QueryFilterState } from '../query-filter.model';

/**
 * Keys that allow multiple active (non-suspended) filters simultaneously.
 * Filters with these keys skip sibling suspension entirely.
 */
const AUTHORIZE_MULTIPLE_FILTERS = ['msg', 'es_filter', 'ip', 'port'];

type FieldTypes = Record<string, { type: string }> | undefined;

// ---------------------------------------------------------------------------
// Internal: sibling suspension logic
// ---------------------------------------------------------------------------

/**
 * Returns a new array with sibling-suspension rules applied.
 *
 * "Siblings" are filters sharing the same `key` (excluding `excludeId` when
 * provided, e.g. the filter being updated).
 *
 * Rules:
 * - If the trigger filter is negated → no suspension.
 * - If the key is in AUTHORIZE_MULTIPLE_FILTERS → no suspension.
 * - If the trigger is wildcarded AND the field type is 'text' → only
 *   suspend non-wildcarded, non-negated siblings.
 * - Otherwise → suspend all non-negated siblings.
 */
function applySiblingSuspension(
  filters: QueryFilterState[],
  trigger: QueryFilterState,
  types: FieldTypes,
  excludeId?: string,
): QueryFilterState[] {
  const siblings = filters.filter(
    (f) => f.key === trigger.key && f.id !== excludeId,
  );

  if (
    trigger.is_negated ||
    siblings.length === 0 ||
    AUTHORIZE_MULTIPLE_FILTERS.includes(trigger.key)
  ) {
    return filters;
  }

  const shouldSuspend =
    trigger.is_wildcarded && types?.[trigger.key]?.type === 'text'
      ? (f: QueryFilterState) => !f.is_wildcarded && !f.is_negated
      : (f: QueryFilterState) => !f.is_negated;

  const siblingIds = new Set(siblings.filter(shouldSuspend).map((f) => f.id));

  if (siblingIds.size === 0) return filters;

  return filters.map((f) =>
    siblingIds.has(f.id) ? { ...f, is_suspended: true } : f,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply suspension rules when adding a new filter.
 *
 * Returns a copy of `existing` with sibling filters suspended according to
 * the business rules. The new filter itself is NOT included in the result —
 * use `applyDeduplication` afterwards to place it.
 */
export function applySuspensionOnAdd(
  existing: QueryFilterState[],
  newFilter: QueryFilterState,
  types?: FieldTypes,
): QueryFilterState[] {
  return applySiblingSuspension(
    existing.map((f) => ({ ...f })),
    newFilter,
    types,
  );
}

/**
 * Apply deduplication when adding a filter.
 *
 * If a filter with the same `key` AND `value` already exists, it is replaced
 * in-place by `newFilter`. Otherwise `newFilter` is appended.
 *
 * Returns a new array.
 */
export function applyDeduplication(
  filters: QueryFilterState[],
  newFilter: QueryFilterState,
): QueryFilterState[] {
  const copyIndex = filters.findIndex(
    (f) => f.key === newFilter.key && f.value === newFilter.value,
  );

  if (copyIndex >= 0) {
    return filters.map((f, i) =>
      i === copyIndex ? { ...newFilter } : { ...f },
    );
  }

  return [...filters.map((f) => ({ ...f })), { ...newFilter }];
}

/**
 * Apply suspension rules when updating an existing filter.
 *
 * Finds the filter by `update.id`, merges the update into it, then applies
 * sibling suspension. Returns a new array. If the id is not found, returns
 * a copy of the original array.
 */
export function applySuspensionOnUpdate(
  filters: QueryFilterState[],
  update: QueryFilterState,
  types?: FieldTypes,
): QueryFilterState[] {
  const index = filters.findIndex((f) => f.id === update.id);
  if (index === -1) {
    return filters.map((f) => ({ ...f }));
  }

  const merged = { ...filters[index], ...update };

  // Apply sibling suspension first (excluding self)
  let result = applySiblingSuspension(
    filters.map((f) => ({ ...f })),
    merged,
    types,
    merged.id,
  );

  // Then apply the actual update
  result = result.map((f) => (f.id === update.id ? { ...f, ...update } : f));

  return result;
}

/**
 * Toggle `is_suspended` on the filter with the given id.
 *
 * When unsuspending (going from suspended → active), sibling suspension
 * rules are applied. When suspending, no sibling rules fire.
 *
 * Returns a new array. If the id is not found, returns a copy.
 */
export function applyToggleSuspension(
  filters: QueryFilterState[],
  filterId: string,
  types?: FieldTypes,
): QueryFilterState[] {
  const index = filters.findIndex((f) => f.id === filterId);
  if (index === -1) {
    return filters.map((f) => ({ ...f }));
  }

  const filter = filters[index];
  const willBeActive = filter.is_suspended; // toggling: if currently suspended, will become active

  // Apply sibling suspension only when unsuspending (becoming active)
  let result: QueryFilterState[];
  if (willBeActive) {
    result = applySiblingSuspension(
      filters.map((f) => ({ ...f })),
      filter,
      types,
      filter.id,
    );
  } else {
    result = filters.map((f) => ({ ...f }));
  }

  // Toggle the target filter
  result = result.map((f) =>
    f.id === filterId ? { ...f, is_suspended: !f.is_suspended } : f,
  );

  return result;
}

/**
 * Replace-filters logic: suspend all existing filters, then for each new
 * filter either unsuspend a matching existing filter or create a new one.
 *
 * A "match" requires identical `key`, `value`, `is_negated`, and
 * `is_wildcarded`. New entries can be `QueryFilterState` objects (with `id`)
 * or `FilterInput`-like objects (without `id`), in which case `createFilter`
 * is used.
 *
 * Returns a new array.
 */
export function applyReplaceLogic(
  existing: QueryFilterState[],
  newFilters: Array<
    | QueryFilterState
    | { key: string; value: string | number; options?: Record<string, unknown> }
  >,
  createFilter: (
    key: string,
    value: string | number,
    options?: Record<string, unknown>,
  ) => QueryFilterState,
): QueryFilterState[] {
  // Suspend all existing filters
  const result = existing.map((f) => ({ ...f, is_suspended: true }));

  for (const newFilter of newFilters) {
    const isQueryFilterState = 'id' in newFilter;

    const isNegated = isQueryFilterState
      ? (newFilter as QueryFilterState).is_negated
      : !!(newFilter as { options?: Record<string, unknown> }).options
          ?.is_negated;
    const isWildcarded = isQueryFilterState
      ? (newFilter as QueryFilterState).is_wildcarded
      : !!(newFilter as { options?: Record<string, unknown> }).options
          ?.is_wildcarded;

    const copyIndex = result.findIndex(
      (f) =>
        f.key === newFilter.key &&
        f.value === newFilter.value &&
        f.is_negated === isNegated &&
        f.is_wildcarded === isWildcarded,
    );

    if (copyIndex >= 0) {
      result[copyIndex] = { ...result[copyIndex], is_suspended: false };
    } else if (isQueryFilterState) {
      result.push({ ...(newFilter as QueryFilterState) });
    } else {
      const input = newFilter as {
        key: string;
        value: string | number;
        options?: Record<string, unknown>;
      };
      result.push(createFilter(input.key, input.value, input.options));
    }
  }

  return result;
}

/**
 * Upsert a filter by its `role`. If a filter with the same role already
 * exists, update it (preserving the original `id`). Otherwise append.
 *
 * Returns a new array.
 */
export function applyUpsertByRole(
  filters: QueryFilterState[],
  newFilter: QueryFilterState,
): QueryFilterState[] {
  const existingIndex = filters.findIndex(
    (f) => f.role != null && f.role === newFilter.role,
  );

  if (existingIndex === -1) {
    return [...filters.map((f) => ({ ...f })), { ...newFilter }];
  }

  // Update existing: keep the original id, apply everything else from newFilter
  return filters.map((f, i) => {
    if (i === existingIndex) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _discarded, ...rest } = newFilter;
      return { ...f, ...rest };
    }
    return { ...f };
  });
}
