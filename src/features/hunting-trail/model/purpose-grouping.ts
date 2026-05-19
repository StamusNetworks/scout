import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
  type TimelineEventType,
  type TypeColorConfig,
} from './hunting-trail';

export type QueryMetadata = {
  name: string;
  description: string;
};

export type QueryMetadataMap = Record<string, QueryMetadata>;

export type QueryGroup = {
  type: TimelineEventType;
  name: string;
  description: string;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

export type PurposeGroup = {
  label: string;
  color: TypeColorConfig;
  queryGroups: QueryGroup[];
  totalEvents: number;
};

const fallbackMeta = (type: TimelineEventType): QueryMetadata => ({
  name: type,
  description: '',
});

export const groupEventsByType = (
  events: TaggedEvent[],
  metadata: QueryMetadataMap = {},
): QueryGroup[] => {
  const byType = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = byType.get(event.timelineType);
    if (list) list.push(event);
    else byType.set(event.timelineType, [event]);
  }

  const groups: QueryGroup[] = [];
  for (const [type, evts] of byType) {
    const sorted = [...evts].toSorted(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const meta = metadata[type] ?? fallbackMeta(type);
    groups.push({
      type,
      name: meta.name,
      description: meta.description,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    });
  }
  return groups;
};

export const buildPurposeGroups = (
  groups: Record<PurposeSlug, PurposeGroupData>,
  metadata: QueryMetadataMap = {},
): PurposeGroup[] =>
  PURPOSE_SLUGS.map(({ slug }) => {
    const { label, color } = PURPOSE_SLUG_MAP[slug];
    const groupData = groups[slug];
    return {
      label,
      color,
      queryGroups: groupEventsByType(groupData.events, metadata),
      totalEvents: groupData.count,
    };
  }).filter((g) => g.queryGroups.length > 0);
