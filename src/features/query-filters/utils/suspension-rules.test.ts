import { describe, expect, it } from 'vitest';

import { QueryFilterState } from '../model/query-filter';
import {
  applyDeduplication,
  applyReplaceLogic,
  applySuspensionOnAdd,
  applySuspensionOnUpdate,
  applyToggleSuspension,
  applyUpsertByRole,
} from './suspension-rules';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let nextId = 1;
function makeFilter(
  overrides: Partial<QueryFilterState> & Pick<QueryFilterState, 'key'>,
): QueryFilterState {
  return {
    id: `filter-${nextId++}`,
    value: 'default-value',
    is_suspended: false,
    is_negated: false,
    is_wildcarded: false,
    ...overrides,
  };
}

// Reset the id counter before each test so ids are predictable
beforeEach(() => {
  nextId = 1;
});

// ---------------------------------------------------------------------------
// applySuspensionOnAdd
// ---------------------------------------------------------------------------

describe('applySuspensionOnAdd', () => {
  it('suspends non-negated siblings when adding a non-negated filter with the same key', () => {
    const existing = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'dest_ip', value: '10.0.0.2' }),
    ];
    const newFilter = makeFilter({ key: 'src_ip', value: '10.0.0.3' });

    const result = applySuspensionOnAdd(existing, newFilter);

    expect(result[0].is_suspended).toBe(true); // sibling with same key
    expect(result[1].is_suspended).toBe(false); // different key, untouched
  });

  it('does NOT suspend for keys in AUTHORIZE_MULTIPLE_FILTERS', () => {
    for (const key of ['msg', 'es_filter', 'ip', 'port']) {
      const existing = [makeFilter({ key, value: 'val1' })];
      const newFilter = makeFilter({ key, value: 'val2' });

      const result = applySuspensionOnAdd(existing, newFilter);

      expect(result[0].is_suspended).toBe(false);
    }
  });

  it('does NOT suspend negated siblings', () => {
    const existing = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1', is_negated: true }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2', is_negated: false }),
    ];
    const newFilter = makeFilter({ key: 'src_ip', value: '10.0.0.3' });

    const result = applySuspensionOnAdd(existing, newFilter);

    expect(result[0].is_suspended).toBe(false); // negated sibling, not suspended
    expect(result[1].is_suspended).toBe(true); // non-negated sibling, suspended
  });

  it('does NOT suspend when the new filter is negated', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({
      key: 'src_ip',
      value: '10.0.0.3',
      is_negated: true,
    });

    const result = applySuspensionOnAdd(existing, newFilter);

    expect(result[0].is_suspended).toBe(false);
  });

  it('does NOT suspend when there are no siblings', () => {
    const existing = [makeFilter({ key: 'dest_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({ key: 'src_ip', value: '10.0.0.3' });

    const result = applySuspensionOnAdd(existing, newFilter);

    expect(result[0].is_suspended).toBe(false);
  });

  it('when wildcarded + text type, only suspends non-wildcarded siblings', () => {
    const existing = [
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_wildcarded: true,
      }),
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.2',
        is_wildcarded: false,
      }),
    ];
    const newFilter = makeFilter({
      key: 'src_ip',
      value: '10.*',
      is_wildcarded: true,
    });

    const types = { src_ip: { type: 'text' as const } };
    const result = applySuspensionOnAdd(existing, newFilter, types);

    expect(result[0].is_suspended).toBe(false); // wildcarded sibling, not suspended
    expect(result[1].is_suspended).toBe(true); // non-wildcarded sibling, suspended
  });

  it('when wildcarded + non-text type, suspends all non-negated siblings', () => {
    const existing = [
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_wildcarded: true,
      }),
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.2',
        is_wildcarded: false,
      }),
    ];
    const newFilter = makeFilter({
      key: 'src_ip',
      value: '10.*',
      is_wildcarded: true,
    });

    const types = { src_ip: { type: 'keyword' as const } };
    const result = applySuspensionOnAdd(existing, newFilter, types);

    expect(result[0].is_suspended).toBe(true);
    expect(result[1].is_suspended).toBe(true);
  });

  it('returns a new array without mutating the original', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({ key: 'src_ip', value: '10.0.0.3' });

    const result = applySuspensionOnAdd(existing, newFilter);

    expect(result).not.toBe(existing);
    expect(existing[0].is_suspended).toBe(false); // original not mutated
  });
});

// ---------------------------------------------------------------------------
// applyDeduplication
// ---------------------------------------------------------------------------

describe('applyDeduplication', () => {
  it('replaces an existing filter with the same key and value', () => {
    const existing = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'dest_ip', value: '10.0.0.2' }),
    ];
    const replacement = makeFilter({
      key: 'src_ip',
      value: '10.0.0.1',
      is_suspended: true,
    });

    const result = applyDeduplication(existing, replacement);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('src_ip');
    expect(result[0].is_suspended).toBe(true);
    expect(result[0].id).toBe(replacement.id); // replaced with new filter
  });

  it('appends when no duplicate exists', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({ key: 'src_ip', value: '10.0.0.99' });

    const result = applyDeduplication(existing, newFilter);

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe(newFilter.id);
  });

  it('returns a new array without mutating the original', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({ key: 'dest_ip', value: '10.0.0.2' });

    const result = applyDeduplication(existing, newFilter);

    expect(result).not.toBe(existing);
    expect(existing).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// applySuspensionOnUpdate
// ---------------------------------------------------------------------------

describe('applySuspensionOnUpdate', () => {
  it('suspends non-negated siblings when updating a filter', () => {
    const filters = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2' }),
      makeFilter({ key: 'dest_ip', value: '10.0.0.3' }),
    ];
    // Update the first filter (simulate changing its value)
    const update: QueryFilterState = {
      ...filters[0],
      value: '10.0.0.99',
    };

    const result = applySuspensionOnUpdate(filters, update);

    expect(result[0].value).toBe('10.0.0.99'); // updated
    expect(result[1].is_suspended).toBe(true); // sibling suspended
    expect(result[2].is_suspended).toBe(false); // different key, not suspended
  });

  it('returns original filters unchanged when filter id is not found', () => {
    const filters = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const update: QueryFilterState = makeFilter({
      id: 'nonexistent',
      key: 'src_ip',
      value: '10.0.0.99',
    });

    const result = applySuspensionOnUpdate(filters, update);

    expect(result).toEqual(filters);
  });

  it('does NOT suspend when the updated filter is negated', () => {
    const filters = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2' }),
    ];
    const update: QueryFilterState = {
      ...filters[0],
      is_negated: true,
    };

    const result = applySuspensionOnUpdate(filters, update);

    expect(result[1].is_suspended).toBe(false);
  });

  it('does NOT suspend when key is in AUTHORIZE_MULTIPLE_FILTERS', () => {
    const filters = [
      makeFilter({ key: 'msg', value: 'hello' }),
      makeFilter({ key: 'msg', value: 'world' }),
    ];
    const update: QueryFilterState = { ...filters[0], value: 'updated' };

    const result = applySuspensionOnUpdate(filters, update);

    expect(result[1].is_suspended).toBe(false);
  });

  it('when wildcarded + text type, only suspends non-wildcarded siblings', () => {
    const filters = [
      makeFilter({
        key: 'src_ip',
        value: '10.*',
        is_wildcarded: true,
      }),
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_wildcarded: false,
      }),
      makeFilter({
        key: 'src_ip',
        value: '192.*',
        is_wildcarded: true,
      }),
    ];
    const update: QueryFilterState = {
      ...filters[0],
      value: '10.0.*',
      is_wildcarded: true,
    };

    const types = { src_ip: { type: 'text' as const } };
    const result = applySuspensionOnUpdate(filters, update, types);

    expect(result[1].is_suspended).toBe(true); // non-wildcarded sibling
    expect(result[2].is_suspended).toBe(false); // wildcarded sibling
  });

  it('merges the update fields into the existing filter', () => {
    const filters = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const update: QueryFilterState = {
      ...filters[0],
      value: '10.0.0.99',
      is_negated: true,
    };

    const result = applySuspensionOnUpdate(filters, update);

    expect(result[0].value).toBe('10.0.0.99');
    expect(result[0].is_negated).toBe(true);
    expect(result[0].id).toBe(filters[0].id);
  });
});

// ---------------------------------------------------------------------------
// applyToggleSuspension
// ---------------------------------------------------------------------------

describe('applyToggleSuspension', () => {
  it('toggles is_suspended from false to true', () => {
    const filters = [makeFilter({ key: 'src_ip', is_suspended: false })];

    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(true);
  });

  it('toggles is_suspended from true to false', () => {
    const filters = [makeFilter({ key: 'src_ip', is_suspended: true })];

    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(false);
  });

  it('applies sibling suspension when unsuspending (toggling from true to false)', () => {
    const filters = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1', is_suspended: true }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2', is_suspended: false }),
    ];

    // Unsuspend the first filter — should trigger sibling suspension
    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(false); // toggled to unsuspended
    expect(result[1].is_suspended).toBe(true); // sibling suspended
  });

  it('does NOT apply sibling suspension when suspending (toggling from false to true)', () => {
    const filters = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1', is_suspended: false }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2', is_suspended: false }),
    ];

    // Suspend the first filter — should NOT trigger sibling suspension
    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(true); // toggled to suspended
    expect(result[1].is_suspended).toBe(false); // sibling untouched
  });

  it('returns original filters when filter id is not found', () => {
    const filters = [makeFilter({ key: 'src_ip' })];

    const result = applyToggleSuspension(filters, 'nonexistent-id');

    expect(result).toEqual(filters);
  });

  it('does NOT suspend siblings when filter is negated', () => {
    const filters = [
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_suspended: true,
        is_negated: true,
      }),
      makeFilter({ key: 'src_ip', value: '10.0.0.2', is_suspended: false }),
    ];

    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(false); // toggled
    expect(result[1].is_suspended).toBe(false); // not suspended, filter is negated
  });

  it('does NOT suspend siblings for AUTHORIZE_MULTIPLE_FILTERS keys', () => {
    const filters = [
      makeFilter({ key: 'msg', value: 'hello', is_suspended: true }),
      makeFilter({ key: 'msg', value: 'world', is_suspended: false }),
    ];

    const result = applyToggleSuspension(filters, filters[0].id);

    expect(result[0].is_suspended).toBe(false); // toggled
    expect(result[1].is_suspended).toBe(false); // not suspended (msg is authorized)
  });
});

// ---------------------------------------------------------------------------
// applyReplaceLogic
// ---------------------------------------------------------------------------

describe('applyReplaceLogic', () => {
  const createFilter = (
    key: string,
    value: string | number,
    options?: {
      is_negated?: boolean;
      is_wildcarded?: boolean;
      is_suspended?: boolean;
      role?: string;
    },
  ): QueryFilterState => ({
    id: `new-${nextId++}`,
    key,
    value,
    is_negated: options?.is_negated ?? false,
    is_wildcarded: options?.is_wildcarded ?? false,
    is_suspended: options?.is_suspended ?? false,
    role: options?.role,
  });

  it('suspends all existing filters', () => {
    const existing = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'dest_ip', value: '10.0.0.2' }),
    ];
    const newFilters: QueryFilterState[] = [];

    const result = applyReplaceLogic(existing, newFilters, createFilter);

    expect(result.every((f) => f.is_suspended)).toBe(true);
  });

  it('unsuspends matching existing filters instead of creating new ones', () => {
    const existing = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
      makeFilter({ key: 'dest_ip', value: '10.0.0.2' }),
    ];
    const newFilters: QueryFilterState[] = [
      makeFilter({ key: 'src_ip', value: '10.0.0.1' }),
    ];

    const result = applyReplaceLogic(existing, newFilters, createFilter);

    // src_ip filter should be unsuspended (matched)
    const srcFilter = result.find(
      (f) => f.key === 'src_ip' && f.value === '10.0.0.1',
    );
    expect(srcFilter?.is_suspended).toBe(false);

    // dest_ip filter should remain suspended
    const destFilter = result.find((f) => f.key === 'dest_ip');
    expect(destFilter?.is_suspended).toBe(true);
  });

  it('creates new filters for non-matching entries', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilters: QueryFilterState[] = [
      makeFilter({ key: 'dest_ip', value: '10.0.0.2' }),
    ];

    const result = applyReplaceLogic(existing, newFilters, createFilter);

    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('src_ip');
    expect(result[0].is_suspended).toBe(true);
    expect(result[1].key).toBe('dest_ip');
    expect(result[1].is_suspended).toBe(false);
  });

  it('matches by key, value, is_negated, and is_wildcarded', () => {
    const existing = [
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_negated: true,
      }),
    ];
    // Same key+value but NOT negated — should NOT match
    const newFilters: QueryFilterState[] = [
      makeFilter({
        key: 'src_ip',
        value: '10.0.0.1',
        is_negated: false,
      }),
    ];

    const result = applyReplaceLogic(existing, newFilters, createFilter);

    // existing remains suspended (no match because negated differs)
    expect(result[0].is_suspended).toBe(true);
    // new filter created
    expect(result).toHaveLength(2);
  });

  it('handles FilterInput-style objects (without id property)', () => {
    const existing = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newInputs = [{ key: 'dest_ip', value: '192.168.0.1' }] as Array<{
      key: string;
      value: string | number;
    }>;

    const result = applyReplaceLogic(
      existing,
      newInputs as QueryFilterState[],
      createFilter,
    );

    expect(result).toHaveLength(2);
    expect(result[1].key).toBe('dest_ip');
  });
});

// ---------------------------------------------------------------------------
// applyUpsertByRole
// ---------------------------------------------------------------------------

describe('applyUpsertByRole', () => {
  it('creates a new filter when no existing filter has the role', () => {
    const filters = [makeFilter({ key: 'src_ip', value: '10.0.0.1' })];
    const newFilter = makeFilter({
      key: 'alert.severity',
      value: '3',
      role: 'severity-slider',
    });

    const result = applyUpsertByRole(filters, newFilter);

    expect(result).toHaveLength(2);
    expect(result[1].key).toBe('alert.severity');
    expect(result[1].role).toBe('severity-slider');
  });

  it('updates an existing filter with the same role, preserving its id', () => {
    const filters = [
      makeFilter({
        key: 'alert.severity',
        value: '3',
        role: 'severity-slider',
      }),
    ];
    const update = makeFilter({
      key: 'alert.severity',
      value: '5',
      role: 'severity-slider',
    });

    const result = applyUpsertByRole(filters, update);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(filters[0].id); // original id preserved
    expect(result[0].value).toBe('5'); // value updated
    expect(result[0].role).toBe('severity-slider');
  });

  it('does not match filters without a role', () => {
    const filters = [
      makeFilter({ key: 'alert.severity', value: '3' }), // no role
    ];
    const newFilter = makeFilter({
      key: 'alert.severity',
      value: '5',
      role: 'severity-slider',
    });

    const result = applyUpsertByRole(filters, newFilter);

    expect(result).toHaveLength(2); // appended, not replaced
  });

  it('returns a new array without mutating the original', () => {
    const filters = [
      makeFilter({
        key: 'alert.severity',
        value: '3',
        role: 'severity-slider',
      }),
    ];
    const update = makeFilter({
      key: 'alert.severity',
      value: '5',
      role: 'severity-slider',
    });

    const result = applyUpsertByRole(filters, update);

    expect(result).not.toBe(filters);
    expect(filters[0].value).toBe('3'); // original not mutated
  });
});
