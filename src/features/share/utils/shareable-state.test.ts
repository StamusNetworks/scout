import { describe, expect, test } from 'vitest';

import {
  buildShareableState,
  buildShareUrl,
  decodeShareableState,
  encodeShareableState,
  type ShareableState,
  type ShareableTime,
  toDatesPayload,
  toFilterInputs,
} from './shareable-state';

const FULL_STATE: ShareableState = {
  route: '/hosts/42/incidents',
  tenant: 4,
  time: { type: 'from', duration: 30, unit: 'days' },
  tags: {
    alert: true,
    stamus: true,
    discovery: false,
    relevant: true,
    informational: false,
    untagged: true,
    novelty: false,
  },
  filters: [
    { key: 'src_ip', value: '192.168.1.1' },
    { key: 'msg', value: 'alert test', negated: true },
    { key: 'alert.severity', value: 3, wildcarded: true },
  ],
};

describe('encodeShareableState / decodeShareableState', () => {
  test('roundtrips a full state', () => {
    const encoded = encodeShareableState(FULL_STATE);
    expect(typeof encoded).toBe('string');
    expect(decodeShareableState(encoded)).toEqual(FULL_STATE);
  });

  test('roundtrips minimal state (no tenant, no filters)', () => {
    const minimal: ShareableState = {
      route: '/explorer',
      time: { type: 'all' },
      tags: {
        alert: true,
        stamus: true,
        discovery: true,
        relevant: true,
        informational: true,
        untagged: true,
        novelty: false,
      },
      filters: [],
    };
    expect(decodeShareableState(encodeShareableState(minimal))).toEqual(
      minimal,
    );
  });

  test('produces URL-safe output (no +, /, =)', () => {
    const encoded = encodeShareableState(FULL_STATE);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  test('returns null for invalid input', () => {
    expect(decodeShareableState('')).toBeNull();
    expect(decodeShareableState('not-valid-base64!!!')).toBeNull();
    expect(decodeShareableState('dGVzdA')).toBeNull(); // valid base64 but not JSON ShareableState
  });

  test('handles auto time type', () => {
    const state: ShareableState = {
      ...FULL_STATE,
      time: { type: 'auto' },
    };
    expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
  });

  test('handles range time type', () => {
    const state: ShareableState = {
      ...FULL_STATE,
      time: { type: 'range', start: 1700000000000, end: 1700100000000 },
    };
    expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
  });

  test('roundtrips a route with search params', () => {
    const state: ShareableState = {
      ...FULL_STATE,
      route: '/hosts/42/incidents?page=3&sort=desc',
    };
    expect(decodeShareableState(encodeShareableState(state))).toEqual(state);
  });
});

// Mock types matching Redux state shapes
const DATES_FROM = {
  type: 'from' as const,
  from_duration: 30,
  from_unit: 'days' as const,
  from: 1700000000000,
  to: 1700100000000,
};

const DATES_RANGE = {
  type: 'range' as const,
  from: 1700000000000,
  to: 1700100000000,
  from_duration: undefined,
  from_unit: undefined,
};

const DATES_AUTO = {
  type: 'auto' as const,
  from: 1700000000000,
  to: 1700100000000,
  from_duration: undefined,
  from_unit: undefined,
};

const DATES_ALL = {
  type: 'all' as const,
  from: undefined,
  to: undefined,
  from_duration: undefined,
  from_unit: undefined,
};

const FLAGS = {
  eventTypes: {
    alert: true,
    stamus: true,
    discovery: false,
  },
  alertTags: {
    relevant: true,
    informational: false,
    untagged: true,
  },
  novelty: false,
};

// Flat serialized form (what ends up in the URL).
const SERIALIZED_FLAGS = {
  alert: true,
  stamus: true,
  discovery: false,
  relevant: true,
  informational: false,
  untagged: true,
  novelty: false,
};

const QUERY_FILTERS = [
  {
    id: '1',
    key: 'src_ip',
    value: '192.168.1.1',
    isSuspended: false,
    isNegated: false,
    isWildcarded: false,
  },
  {
    id: '2',
    key: 'msg',
    value: 'test',
    isSuspended: true,
    isNegated: true,
    isWildcarded: false,
  },
  {
    id: '3',
    key: 'alert.severity',
    value: 3,
    isSuspended: false,
    isNegated: false,
    isWildcarded: true,
  },
];

describe('buildShareableState', () => {
  test('builds state with relative time', () => {
    const result = buildShareableState(
      '/hosts/42/incidents',
      DATES_FROM,
      QUERY_FILTERS,
      FLAGS,
      4,
    );
    expect(result).toEqual({
      route: '/hosts/42/incidents',
      tenant: 4,
      time: { type: 'from', duration: 30, unit: 'days' },
      tags: SERIALIZED_FLAGS,
      filters: [
        { key: 'src_ip', value: '192.168.1.1' },
        { key: 'alert.severity', value: 3, wildcarded: true },
      ],
    });
  });

  test('excludes suspended filters', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      QUERY_FILTERS,
      FLAGS,
      undefined,
    );
    expect(result.filters).toHaveLength(2);
    expect(result.filters.find((f) => f.key === 'msg')).toBeUndefined();
  });

  test('omits tenant when undefined', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      [],
      FLAGS,
      undefined,
    );
    expect(result.tenant).toBeUndefined();
    expect('tenant' in result).toBe(false);
  });

  test('omits negated/wildcarded when false', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_ALL,
      QUERY_FILTERS,
      FLAGS,
      undefined,
    );
    const srcIpFilter = result.filters.find((f) => f.key === 'src_ip')!;
    expect('negated' in srcIpFilter).toBe(false);
    expect('wildcarded' in srcIpFilter).toBe(false);
  });

  test('handles range time', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_RANGE,
      [],
      FLAGS,
      undefined,
    );
    expect(result.time).toEqual({
      type: 'range',
      start: 1700000000000,
      end: 1700100000000,
    });
  });

  test('handles auto time', () => {
    const result = buildShareableState(
      '/explorer',
      DATES_AUTO,
      [],
      FLAGS,
      undefined,
    );
    expect(result.time).toEqual({ type: 'auto' });
  });

  test('includes search params in route', () => {
    const result = buildShareableState(
      '/hosts/42/incidents?page=3&sort=desc',
      DATES_FROM,
      QUERY_FILTERS,
      FLAGS,
      4,
    );
    expect(result.route).toBe('/hosts/42/incidents?page=3&sort=desc');
  });
});

describe('buildShareUrl', () => {
  test('produces a valid share URL', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/');
    expect(url).toMatch(/^https:\/\/scout\.app\/share\?s=.+$/);
    // Roundtrip: decode the s param
    const s = new URL(url).searchParams.get('s')!;
    expect(decodeShareableState(s)).toEqual(FULL_STATE);
  });

  test('handles base path with trailing slash', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/app/');
    expect(url).toMatch(/^https:\/\/scout\.app\/app\/share\?s=.+$/);
  });

  test('handles base path without trailing slash', () => {
    const url = buildShareUrl(FULL_STATE, 'https://scout.app', '/app');
    expect(url).toMatch(/^https:\/\/scout\.app\/app\/share\?s=.+$/);
  });
});

describe('toDatesPayload', () => {
  test('passes through "all"', () => {
    expect(toDatesPayload({ type: 'all' })).toEqual({ type: 'all' });
  });

  test('expands "auto" to a concrete range bounded at now', () => {
    const before = Date.now();
    const payload = toDatesPayload({ type: 'auto' });
    const after = Date.now();
    if (payload.type !== 'auto') throw new Error('expected auto');
    expect(payload.from).toBe(0);
    expect(payload.to).toBeGreaterThanOrEqual(before);
    expect(payload.to).toBeLessThanOrEqual(after);
  });

  test('renames the "from" relative-window keys to domain shape', () => {
    const time: ShareableTime = {
      type: 'from',
      duration: 7,
      unit: 'days',
    };
    expect(toDatesPayload(time)).toEqual({
      type: 'from',
      from_duration: 7,
      from_unit: 'days',
    });
  });

  test('renames "range" start/end to from/to', () => {
    const time: ShareableTime = {
      type: 'range',
      start: 1_000_000,
      end: 2_000_000,
    };
    expect(toDatesPayload(time)).toEqual({
      type: 'range',
      from: 1_000_000,
      to: 2_000_000,
    });
  });
});

describe('toFilterInputs', () => {
  test('omits negated/wildcarded options when absent', () => {
    expect(toFilterInputs([{ key: 'src_ip', value: '10.0.0.1' }])).toEqual([
      { key: 'src_ip', value: '10.0.0.1', options: {} },
    ]);
  });

  test('passes negated and wildcarded options through', () => {
    expect(
      toFilterInputs([
        { key: 'msg', value: 'x', negated: true, wildcarded: true },
      ]),
    ).toEqual([
      {
        key: 'msg',
        value: 'x',
        options: { isNegated: true, isWildcarded: true },
      },
    ]);
  });

  test('drops false flags rather than emitting them', () => {
    expect(
      toFilterInputs([
        { key: 'k', value: 'v', negated: false, wildcarded: false },
      ]),
    ).toEqual([{ key: 'k', value: 'v', options: {} }]);
  });
});
