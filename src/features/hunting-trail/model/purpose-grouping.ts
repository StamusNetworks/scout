import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  type PurposeGroupData,
  type PurposeSlug,
  type TaggedEvent,
  type TimelineEventType,
  type TypeColorConfig,
} from './hunting-trail';

export type QueryGroup = {
  type: TimelineEventType;
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

export const groupEventsByType = (events: TaggedEvent[]): QueryGroup[] => {
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
    groups.push({
      type,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    });
  }
  return groups;
};

export const buildPurposeGroups = (
  groups: Record<PurposeSlug, PurposeGroupData>,
): PurposeGroup[] =>
  PURPOSE_SLUGS.map(({ slug }) => {
    const { label, color } = PURPOSE_SLUG_MAP[slug];
    const groupData = groups[slug];
    return {
      label,
      color,
      queryGroups: groupEventsByType(groupData.events),
      totalEvents: groupData.count,
    };
  }).filter((g) => g.queryGroups.length > 0);
