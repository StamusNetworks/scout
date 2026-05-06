import { describe, expect, it } from 'vitest';

import { type QueryFilterState } from '../model/query-filter';
import { buildEventsQfilter } from './build-events-qfilter';
import { QFBuilder } from './qf-builder';

const qfBuilder = QFBuilder({}, 'raw');

const eventFilter = (
  key: string,
  value: string | number,
  overrides: Partial<QueryFilterState> = {},
): QueryFilterState => ({
  id: `id-${key}`,
  key,
  value,
  isSuspended: false,
  isNegated: false,
  isWildcarded: false,
  ...overrides,
});

describe('buildEventsQfilter', () => {
  it('returns undefined when there are no filters and no extension', () => {
    expect(
      buildEventsQfilter({
        queryFilters: [],
        alertTags: undefined,
        novelty: false,
        investigation: undefined,
        filterExtension: [],
        qfBuilder,
      }),
    ).toBeUndefined();
  });

  it('drops suspended filters', () => {
    const result = buildEventsQfilter({
      queryFilters: [
        eventFilter('src_ip', '10.0.0.1'),
        eventFilter('src_port', 80, { isSuspended: true }),
      ],
      alertTags: undefined,
      novelty: false,
      investigation: undefined,
      filterExtension: [],
      qfBuilder,
    });
    expect(result).toContain('10.0.0.1');
    expect(result).not.toContain('80');
  });

  it('drops host_id-prefixed filters when no def is found', () => {
    const result = buildEventsQfilter({
      queryFilters: [
        eventFilter('src_ip', '10.0.0.1'),
        eventFilter('host_id.roles.name', 'web'),
      ],
      alertTags: undefined,
      novelty: false,
      investigation: undefined,
      filterExtension: [],
      qfBuilder,
    });
    expect(result).toContain('10.0.0.1');
    expect(result).not.toContain('web');
  });

  it('appends a string filterExtension after AND', () => {
    const result = buildEventsQfilter({
      queryFilters: [eventFilter('src_ip', '10.0.0.1')],
      alertTags: undefined,
      novelty: false,
      investigation: undefined,
      filterExtension: 'custom_field:foo',
      qfBuilder,
    });
    expect(result).toContain(' AND ');
    expect(result).toContain('custom_field:foo');
  });

  it('returns the bare extension when no other filters apply', () => {
    expect(
      buildEventsQfilter({
        queryFilters: [],
        alertTags: undefined,
        novelty: false,
        investigation: undefined,
        filterExtension: 'custom_field:foo',
        qfBuilder,
      }),
    ).toBe(' custom_field:foo');
  });

  it('inlines investigation.current as a created filter', () => {
    const result = buildEventsQfilter({
      queryFilters: [],
      alertTags: undefined,
      novelty: false,
      investigation: {
        current: { key: 'src_ip', value: '10.0.0.1' },
        stages: [],
      },
      filterExtension: [],
      qfBuilder,
    });
    expect(result).toContain('10.0.0.1');
  });

  it('skips investigation.current when key or value is missing', () => {
    expect(
      buildEventsQfilter({
        queryFilters: [],
        alertTags: undefined,
        novelty: false,
        investigation: {
          current: { key: undefined, value: undefined },
          stages: [],
        },
        filterExtension: [],
        qfBuilder,
      }),
    ).toBeUndefined();
  });
});
