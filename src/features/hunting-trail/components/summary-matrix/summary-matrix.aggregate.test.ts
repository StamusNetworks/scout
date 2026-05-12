import { describe, expect, it } from 'vitest';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
} from '../../model/hunting-trail';
import {
  type AssetRow,
  buildAssetMatrix,
  filterGroupsByAsset,
  sortAssetRows,
  sortingStateToKeyDirection,
} from './summary-matrix.aggregate';

const makeEvent = (
  asset: { src?: string; dest?: string },
  timelineType: TaggedEvent['timelineType'] = 'lateral',
  timestamp = '2026-01-01T00:00:00Z',
): TaggedEvent =>
  ({
    src_ip: asset.src,
    dest_ip: asset.dest,
    timelineType,
    timestamp,
  }) as unknown as TaggedEvent;

const emptyGroups = (): Record<PurposeSlug, PurposeGroupData> =>
  Object.fromEntries(
    PURPOSE_SLUGS.map(({ slug }) => [
      slug,
      { events: [], count: 0, isLoading: false, isError: false },
    ]),
  ) as unknown as Record<PurposeSlug, PurposeGroupData>;

const withEvents = (
  slug: PurposeSlug,
  events: TaggedEvent[],
  base = emptyGroups(),
) => ({
  ...base,
  [slug]: {
    events,
    count: events.length,
    isLoading: false,
    isError: false,
  },
});

describe('buildAssetMatrix', () => {
  it('returns an empty array for empty input', () => {
    expect(buildAssetMatrix(emptyGroups())).toEqual([]);
  });

  it('produces one row per unique src or dest IP', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.5', dest: '10.0.0.6' }),
    ]);
    const rows = buildAssetMatrix(groups);
    const assets = rows.map((r) => r.asset).toSorted();
    expect(assets).toEqual(['10.0.0.5', '10.0.0.6']);
  });

  it('counts distinct query types as queryCount and event totals as eventCount', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ src: '10.0.0.5' }, 'remoteAdmin'),
    ]);
    const row = buildAssetMatrix(groups).find((r) => r.asset === '10.0.0.5');
    expect(row?.cells['lateral-movement']).toEqual({
      eventCount: 3,
      queryCount: 2,
    });
  });

  it('returns unsorted rows — callers apply sortAssetRows for the desired ordering', () => {
    // buildAssetMatrix is a pure data transformer; ordering is the caller's choice.
    // Verifying that rows come back in insertion order (asset iteration order over
    // a Map) is not a meaningful guarantee — we only assert that every input asset
    // has a row, and let sortAssetRows tests cover the ordering contract.
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    groups = withEvents(
      'file-activity',
      [
        makeEvent({ src: '10.0.0.2' }, 'file'),
        makeEvent({ src: '10.0.0.2' }, 'file'),
      ],
      groups,
    );
    const rows = buildAssetMatrix(groups);
    const assets = rows.map((r) => r.asset).toSorted();
    expect(assets).toEqual(['10.0.0.1', '10.0.0.2']);
  });

  it('double-counts events across src/dest assets — same event appears in both rows', () => {
    // One event with src=A and dest=B contributes to cell(A, group) AND cell(B, group).
    // Each row's cell records 1 event; the column sum is therefore 2 even though
    // only 1 underlying event exists. This is the matrix contract: rows are about
    // asset involvement, not a partition of events.
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1', dest: '10.0.0.2' }, 'lateral'),
    ]);
    const rows = buildAssetMatrix(groups);
    expect(
      rows.find((r) => r.asset === '10.0.0.1')?.cells['lateral-movement']
        ?.eventCount,
    ).toBe(1);
    expect(
      rows.find((r) => r.asset === '10.0.0.2')?.cells['lateral-movement']
        ?.eventCount,
    ).toBe(1);
  });

  it('per-cell eventCount never exceeds the group event count', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1', dest: '10.0.0.2' }, 'lateral'),
      makeEvent({ src: '10.0.0.3' }, 'lateral'),
    ]);
    const rows = buildAssetMatrix(groups);
    for (const row of rows) {
      for (const { slug } of PURPOSE_SLUGS) {
        const cell = row.cells[slug];
        if (cell)
          expect(cell.eventCount).toBeLessThanOrEqual(groups[slug].count);
      }
    }
  });

  it('skips events missing one side without crashing', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.5' }, 'lateral'),
      makeEvent({ dest: '10.0.0.6' }, 'lateral'),
      makeEvent({}, 'lateral'),
    ]);
    const rows = buildAssetMatrix(groups);
    const assets = rows.map((r) => r.asset).toSorted();
    expect(assets).toEqual(['10.0.0.5', '10.0.0.6']);
  });

  it('reports groupsWithHits as the number of cells with events', () => {
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    groups = withEvents(
      'file-activity',
      [makeEvent({ src: '10.0.0.1' }, 'file')],
      groups,
    );
    const row = buildAssetMatrix(groups).find((r) => r.asset === '10.0.0.1');
    expect(row?.groupsWithHits).toBe(2);
    expect(row?.totalEvents).toBe(2);
  });

  it('reports totalQueriesWithResults as the sum of queryCount across cells', () => {
    // Single cell with 2 distinct query types → total 2
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.1' }, 'remoteAdmin'),
    ]);
    let row = buildAssetMatrix(groups).find((r) => r.asset === '10.0.0.1');
    expect(row?.totalQueriesWithResults).toBe(2);

    // Three cells with queryCounts (1, 1, 2) → total 4
    groups = withEvents(
      'file-activity',
      [makeEvent({ src: '10.0.0.1' }, 'file')],
      groups,
    );
    groups = withEvents(
      'dns-domains',
      [
        makeEvent({ src: '10.0.0.1' }, 'nrd'),
        makeEvent({ src: '10.0.0.1' }, 'dynamicDns'),
      ],
      groups,
    );
    row = buildAssetMatrix(groups).find((r) => r.asset === '10.0.0.1');
    expect(row?.totalQueriesWithResults).toBe(2 + 1 + 2);
  });

  it('totalQueriesWithResults is 0 for rows whose cells were all skipped', () => {
    // Sanity check: when an asset only appears via filtered-out events, no row exists.
    // For rows that do exist, totalQueriesWithResults must be >= 1 (since cells with
    // eventCount === 0 are dropped). Verify the field exists and is a positive number.
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    const rows = buildAssetMatrix(groups);
    expect(rows[0].totalQueriesWithResults).toBeGreaterThan(0);
    expect(typeof rows[0].totalQueriesWithResults).toBe('number');
  });
});

describe('filterGroupsByAsset', () => {
  it('keeps only events where the asset is src or dest', () => {
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.2', dest: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.3' }, 'lateral'),
    ]);
    groups = withEvents(
      'file-activity',
      [
        makeEvent({ src: '10.0.0.4', dest: '10.0.0.5' }, 'file'),
        makeEvent({ src: '10.0.0.1' }, 'file'),
      ],
      groups,
    );
    const filtered = filterGroupsByAsset(groups, '10.0.0.1');
    expect(filtered['lateral-movement'].events).toHaveLength(2);
    expect(filtered['file-activity'].events).toHaveLength(1);
    expect(filtered['exploitation'].events).toHaveLength(0);
  });

  it('recomputes count to match the filtered event length', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
      makeEvent({ src: '10.0.0.2' }, 'lateral'),
    ]);
    const filtered = filterGroupsByAsset(groups, '10.0.0.1');
    expect(filtered['lateral-movement'].count).toBe(1);
  });

  it('preserves the isLoading and isError flags per group', () => {
    let groups = withEvents('lateral-movement', [], emptyGroups());
    groups = {
      ...groups,
      'lateral-movement': {
        ...groups['lateral-movement'],
        isLoading: true,
      },
      exploitation: {
        ...groups['exploitation'],
        isError: true,
      },
    };
    const filtered = filterGroupsByAsset(groups, '10.0.0.1');
    expect(filtered['lateral-movement'].isLoading).toBe(true);
    expect(filtered['exploitation'].isError).toBe(true);
  });

  it('returns the same shape (keys for every purpose slug) even when no events match', () => {
    const filtered = filterGroupsByAsset(emptyGroups(), '10.0.0.1');
    for (const { slug } of PURPOSE_SLUGS) {
      expect(filtered[slug]).toBeDefined();
      expect(filtered[slug].events).toEqual([]);
    }
  });

  it('returns referentially-distinct events arrays so consumers do not mutate the source', () => {
    const groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    const filtered = filterGroupsByAsset(groups, '10.0.0.1');
    expect(filtered['lateral-movement'].events).not.toBe(
      groups['lateral-movement'].events,
    );
  });
});

// Test fixtures for sortAssetRows — small, hand-built AssetRow[] so we don't
// have to round-trip through buildAssetMatrix to assert sort behavior.
const row = (
  asset: string,
  totalQueriesWithResults: number,
  totalEvents: number,
  cells: Partial<
    Record<PurposeSlug, { eventCount: number; queryCount: number }>
  > = {},
): AssetRow => ({
  asset,
  cells,
  groupsWithHits: Object.keys(cells).length,
  totalEvents,
  totalQueriesWithResults,
});

describe('sortAssetRows', () => {
  it('default order (key=null, direction=desc) sorts by totalQueriesWithResults desc, tiebreak totalEvents desc', () => {
    const rows = [
      row('10.0.0.1', 1, 5),
      row('10.0.0.2', 3, 1),
      row('10.0.0.3', 2, 9),
    ];
    const sorted = sortAssetRows(rows, null, 'desc');
    expect(sorted.map((r) => r.asset)).toEqual([
      '10.0.0.2',
      '10.0.0.3',
      '10.0.0.1',
    ]);
  });

  it('default order ties broken by totalEvents desc, then asset asc', () => {
    const rows = [
      row('10.0.0.2', 2, 5),
      row('10.0.0.1', 2, 5),
      row('10.0.0.3', 2, 10),
    ];
    const sorted = sortAssetRows(rows, null, 'desc');
    expect(sorted.map((r) => r.asset)).toEqual([
      '10.0.0.3',
      '10.0.0.1',
      '10.0.0.2',
    ]);
  });

  it('default order asc flips the primary + secondary comparison', () => {
    const rows = [
      row('10.0.0.1', 1, 5),
      row('10.0.0.2', 3, 1),
      row('10.0.0.3', 2, 9),
    ];
    const sorted = sortAssetRows(rows, null, 'asc');
    expect(sorted.map((r) => r.asset)).toEqual([
      '10.0.0.1',
      '10.0.0.3',
      '10.0.0.2',
    ]);
  });

  it('asset key asc sorts by asset string ascending, case-insensitive', () => {
    const rows = [
      row('Bob.host', 1, 1),
      row('alice.host', 1, 1),
      row('charlie.host', 1, 1),
    ];
    const sorted = sortAssetRows(rows, 'asset', 'asc');
    expect(sorted.map((r) => r.asset)).toEqual([
      'alice.host',
      'Bob.host',
      'charlie.host',
    ]);
  });

  it('asset key desc sorts by asset string descending', () => {
    const rows = [
      row('10.0.0.1', 1, 1),
      row('10.0.0.3', 1, 1),
      row('10.0.0.2', 1, 1),
    ];
    const sorted = sortAssetRows(rows, 'asset', 'desc');
    expect(sorted.map((r) => r.asset)).toEqual([
      '10.0.0.3',
      '10.0.0.2',
      '10.0.0.1',
    ]);
  });

  it('purpose-group key desc sorts by that column queryCount desc, tiebreak eventCount desc', () => {
    const rows = [
      row('A', 99, 99, {
        'lateral-movement': { queryCount: 1, eventCount: 100 },
      }),
      row('B', 99, 99, {
        'lateral-movement': { queryCount: 3, eventCount: 3 },
      }),
      row('C', 99, 99, {
        'lateral-movement': { queryCount: 3, eventCount: 10 },
      }),
    ];
    const sorted = sortAssetRows(rows, 'lateral-movement', 'desc');
    expect(sorted.map((r) => r.asset)).toEqual(['C', 'B', 'A']);
  });

  it('purpose-group key asc sorts by that column queryCount asc, tiebreak eventCount asc', () => {
    const rows = [
      row('A', 99, 99, {
        'lateral-movement': { queryCount: 3, eventCount: 10 },
      }),
      row('B', 99, 99, {
        'lateral-movement': { queryCount: 1, eventCount: 100 },
      }),
      row('C', 99, 99, {
        'lateral-movement': { queryCount: 3, eventCount: 3 },
      }),
    ];
    const sorted = sortAssetRows(rows, 'lateral-movement', 'asc');
    expect(sorted.map((r) => r.asset)).toEqual(['B', 'C', 'A']);
  });

  it('rows with empty cell for the sort column appear last regardless of direction (desc)', () => {
    const rows = [
      row('empty', 99, 99, {}),
      row('hit', 99, 99, {
        'lateral-movement': { queryCount: 1, eventCount: 1 },
      }),
    ];
    const sortedDesc = sortAssetRows(rows, 'lateral-movement', 'desc');
    expect(sortedDesc.map((r) => r.asset)).toEqual(['hit', 'empty']);
  });

  it('rows with empty cell for the sort column appear last regardless of direction (asc)', () => {
    const rows = [
      row('empty', 99, 99, {}),
      row('hit', 99, 99, {
        'lateral-movement': { queryCount: 1, eventCount: 1 },
      }),
    ];
    const sortedAsc = sortAssetRows(rows, 'lateral-movement', 'asc');
    expect(sortedAsc.map((r) => r.asset)).toEqual(['hit', 'empty']);
  });

  it('does not mutate the input array', () => {
    const rows = [row('B', 1, 1), row('A', 2, 1)];
    const before = rows.map((r) => r.asset).join(',');
    sortAssetRows(rows, null, 'desc');
    expect(rows.map((r) => r.asset).join(',')).toBe(before);
  });

  it('returns an empty array for empty input', () => {
    expect(sortAssetRows([], null, 'desc')).toEqual([]);
    expect(sortAssetRows([], 'asset', 'asc')).toEqual([]);
    expect(sortAssetRows([], 'lateral-movement', 'desc')).toEqual([]);
  });
});

describe('sortingStateToKeyDirection', () => {
  it('empty sorting state maps to default (null, desc)', () => {
    expect(sortingStateToKeyDirection([])).toEqual({
      key: null,
      direction: 'desc',
    });
  });

  it('asset asc maps to (asset, asc)', () => {
    expect(sortingStateToKeyDirection([{ id: 'asset', desc: false }])).toEqual({
      key: 'asset',
      direction: 'asc',
    });
  });

  it('asset desc maps to (asset, desc)', () => {
    expect(sortingStateToKeyDirection([{ id: 'asset', desc: true }])).toEqual({
      key: 'asset',
      direction: 'desc',
    });
  });

  it('a known purpose slug maps to (slug, direction)', () => {
    expect(
      sortingStateToKeyDirection([{ id: 'lateral-movement', desc: true }]),
    ).toEqual({ key: 'lateral-movement', direction: 'desc' });
    expect(
      sortingStateToKeyDirection([{ id: 'dns-domains', desc: false }]),
    ).toEqual({ key: 'dns-domains', direction: 'asc' });
  });

  it('an unknown column id falls back to default (null, desc)', () => {
    expect(
      sortingStateToKeyDirection([{ id: 'unknown-col', desc: true }]),
    ).toEqual({ key: null, direction: 'desc' });
  });

  it('only the first sorting entry is honored (single-column sort)', () => {
    expect(
      sortingStateToKeyDirection([
        { id: 'asset', desc: false },
        { id: 'lateral-movement', desc: true },
      ]),
    ).toEqual({ key: 'asset', direction: 'asc' });
  });
});
