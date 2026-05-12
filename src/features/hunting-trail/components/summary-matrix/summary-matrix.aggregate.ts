import type { SortingState } from '@tanstack/react-table';

import {
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
  type TimelineEventType,
} from '../../model/hunting-trail';

export type AssetCell = {
  eventCount: number;
  queryCount: number;
};

export type AssetRow = {
  asset: string;
  cells: Partial<Record<PurposeSlug, AssetCell>>;
  groupsWithHits: number;
  totalEvents: number;
  totalQueriesWithResults: number;
};

type Accumulator = {
  cells: Partial<
    Record<PurposeSlug, { eventCount: number; types: Set<TimelineEventType> }>
  >;
};

function eventAssets(event: TaggedEvent): string[] {
  const assets = new Set<string>();
  const src = (event as unknown as { src_ip?: unknown }).src_ip;
  const dest = (event as unknown as { dest_ip?: unknown }).dest_ip;
  if (typeof src === 'string' && src.length > 0) assets.add(src);
  if (typeof dest === 'string' && dest.length > 0) assets.add(dest);
  return [...assets];
}

export function filterGroupsByAsset(
  groups: Record<PurposeSlug, PurposeGroupData>,
  asset: string,
): Record<PurposeSlug, PurposeGroupData> {
  const filtered = {} as Record<PurposeSlug, PurposeGroupData>;
  for (const { slug } of PURPOSE_SLUGS) {
    const source = groups[slug];
    const events = source.events.filter((e) => eventAssets(e).includes(asset));
    filtered[slug] = {
      events,
      count: events.length,
      isLoading: source.isLoading,
      isError: source.isError,
    };
  }
  return filtered;
}

export function buildAssetMatrix(
  groups: Record<PurposeSlug, PurposeGroupData>,
): AssetRow[] {
  const byAsset = new Map<string, Accumulator>();

  for (const { slug } of PURPOSE_SLUGS) {
    for (const event of groups[slug].events) {
      for (const asset of eventAssets(event)) {
        let acc = byAsset.get(asset);
        if (!acc) {
          acc = { cells: {} };
          byAsset.set(asset, acc);
        }
        let cell = acc.cells[slug];
        if (!cell) {
          cell = { eventCount: 0, types: new Set() };
          acc.cells[slug] = cell;
        }
        cell.eventCount += 1;
        cell.types.add(event.timelineType);
      }
    }
  }

  const rows: AssetRow[] = [];
  for (const [asset, acc] of byAsset) {
    const cells: Partial<Record<PurposeSlug, AssetCell>> = {};
    let groupsWithHits = 0;
    let totalEvents = 0;
    let totalQueriesWithResults = 0;
    for (const slug of Object.keys(acc.cells) as PurposeSlug[]) {
      const raw = acc.cells[slug];
      if (!raw || raw.eventCount === 0) continue;
      cells[slug] = { eventCount: raw.eventCount, queryCount: raw.types.size };
      groupsWithHits += 1;
      totalEvents += raw.eventCount;
      totalQueriesWithResults += raw.types.size;
    }
    rows.push({
      asset,
      cells,
      groupsWithHits,
      totalEvents,
      totalQueriesWithResults,
    });
  }

  return rows;
}

export type SortKey = 'asset' | PurposeSlug | null;
export type SortDirection = 'asc' | 'desc';

const PURPOSE_SLUG_SET: ReadonlySet<string> = new Set(
  PURPOSE_SLUGS.map(({ slug }) => slug),
);

function compareAssetAsc(a: AssetRow, b: AssetRow): number {
  return a.asset.localeCompare(b.asset, undefined, { sensitivity: 'base' });
}

function compareDefault(a: AssetRow, b: AssetRow): number {
  if (a.totalQueriesWithResults !== b.totalQueriesWithResults) {
    return b.totalQueriesWithResults - a.totalQueriesWithResults;
  }
  if (a.totalEvents !== b.totalEvents) {
    return b.totalEvents - a.totalEvents;
  }
  return compareAssetAsc(a, b);
}

function comparePurposeCellNonEmpty(
  cellA: AssetCell,
  cellB: AssetCell,
): number {
  if (cellA.queryCount !== cellB.queryCount) {
    return cellB.queryCount - cellA.queryCount;
  }
  return cellB.eventCount - cellA.eventCount;
}

export function sortAssetRows(
  rows: AssetRow[],
  key: SortKey,
  direction: SortDirection,
): AssetRow[] {
  const copy = [...rows];
  if (key === null) {
    copy.sort((a, b) => {
      const cmp = compareDefault(a, b);
      return direction === 'asc' ? -cmp : cmp;
    });
    return copy;
  }
  if (key === 'asset') {
    copy.sort((a, b) => {
      const cmp = compareAssetAsc(a, b);
      return direction === 'desc' ? -cmp : cmp;
    });
    return copy;
  }
  // Purpose-group slug. Empties always sort last regardless of direction.
  copy.sort((a, b) => {
    const cellA = a.cells[key];
    const cellB = b.cells[key];
    if (!cellA && !cellB) return compareAssetAsc(a, b);
    if (!cellA) return 1;
    if (!cellB) return -1;
    const cmp = comparePurposeCellNonEmpty(cellA, cellB);
    return direction === 'asc' ? -cmp : cmp;
  });
  return copy;
}

export function sortingStateToKeyDirection(sorting: SortingState): {
  key: SortKey;
  direction: SortDirection;
} {
  if (sorting.length === 0) return { key: null, direction: 'desc' };
  const [{ id, desc }] = sorting;
  const direction: SortDirection = desc ? 'desc' : 'asc';
  if (id === 'asset') return { key: 'asset', direction };
  if (PURPOSE_SLUG_SET.has(id)) {
    return { key: id as PurposeSlug, direction };
  }
  return { key: null, direction: 'desc' };
}
