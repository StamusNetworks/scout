import { describe, expect, it } from 'vitest';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
} from '../../model/hunting-trail';
import {
  buildAssetMatrix,
  filterGroupsByAsset,
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

  it('sorts rows by groupsWithHits desc, then totalEvents desc', () => {
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    groups = withEvents(
      'exploitation',
      [makeEvent({ src: '10.0.0.1' }, 'postExploit')],
      groups,
    );
    groups = withEvents(
      'dns-domains',
      [makeEvent({ src: '10.0.0.1' }, 'nrd')],
      groups,
    );
    groups = withEvents(
      'file-activity',
      [
        makeEvent({ src: '10.0.0.2' }, 'file'),
        makeEvent({ src: '10.0.0.2' }, 'file'),
      ],
      groups,
    );
    groups = withEvents(
      'network-anomalies',
      [makeEvent({ src: '10.0.0.2' }, 'tor')],
      groups,
    );
    const rows = buildAssetMatrix(groups);
    expect(rows[0].asset).toBe('10.0.0.1');
    expect(rows[1].asset).toBe('10.0.0.2');
  });

  it('breaks ties on groupsWithHits by totalEvents desc', () => {
    let groups = withEvents('lateral-movement', [
      makeEvent({ src: '10.0.0.1' }, 'lateral'),
    ]);
    groups = withEvents(
      'file-activity',
      [
        makeEvent({ src: '10.0.0.2' }, 'file'),
        makeEvent({ src: '10.0.0.2' }, 'file'),
        makeEvent({ src: '10.0.0.2' }, 'file'),
      ],
      groups,
    );
    const rows = buildAssetMatrix(groups);
    expect(rows.map((r) => r.asset)).toEqual(['10.0.0.2', '10.0.0.1']);
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
