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
    for (const slug of Object.keys(acc.cells) as PurposeSlug[]) {
      const raw = acc.cells[slug];
      if (!raw || raw.eventCount === 0) continue;
      cells[slug] = { eventCount: raw.eventCount, queryCount: raw.types.size };
      groupsWithHits += 1;
      totalEvents += raw.eventCount;
    }
    rows.push({ asset, cells, groupsWithHits, totalEvents });
  }

  rows.sort((a, b) => {
    if (b.groupsWithHits !== a.groupsWithHits)
      return b.groupsWithHits - a.groupsWithHits;
    return b.totalEvents - a.totalEvents;
  });

  return rows;
}
