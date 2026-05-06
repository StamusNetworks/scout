import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  PURPOSE_SLUG_MAP,
  PURPOSE_SLUGS,
  PurposeGroupData,
  PurposeSlug,
  TaggedEvent,
  TimelineEventType,
  TypeColorConfig,
} from '../../model/hunting-trail';
import { QueryCard, QueryGroup } from '../query-card/query-card';

// --- Transform ---

type PurposeGroup = {
  label: string;
  color: TypeColorConfig;
  queryGroups: QueryGroup[];
  totalEvents: number;
};

function buildPurposeGroups(
  groups: Record<PurposeSlug, PurposeGroupData>,
): PurposeGroup[] {
  return PURPOSE_SLUGS.map(({ slug }) => {
    const { label, color } = PURPOSE_SLUG_MAP[slug];
    const groupData = groups[slug];

    const byType = new Map<TimelineEventType, TaggedEvent[]>();
    for (const event of groupData.events) {
      const list = byType.get(event.timelineType);
      if (list) list.push(event);
      else byType.set(event.timelineType, [event]);
    }

    const queryGroups: QueryGroup[] = [];
    for (const [type, evts] of byType) {
      const sorted = [...evts].toSorted(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      queryGroups.push({
        type,
        events: sorted,
        startTime: sorted[0].timestamp,
        endTime: sorted[sorted.length - 1].timestamp,
      });
    }

    return { label, color, queryGroups, totalEvents: groupData.count };
  }).filter((g) => g.queryGroups.length > 0);
}

// --- UI ---

const PurposeSection = ({ group }: { group: PurposeGroup }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-semibold"
        onClick={() => setCollapsed((v) => !v)}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span
          className={`${group.color.bg} ${group.color.text} rounded px-1.5 py-0.5`}
        >
          {group.label}
        </span>
        <span className="text-muted-foreground font-normal">
          {group.totalEvents} {group.totalEvents === 1 ? 'event' : 'events'}
        </span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2 pl-2">
          {group.queryGroups.map((qg) => (
            <QueryCard
              key={qg.type}
              group={qg}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PurposeAggregated = ({
  groups,
}: {
  groups: Record<PurposeSlug, PurposeGroupData>;
}) => {
  const purposeGroups = useMemo(() => buildPurposeGroups(groups), [groups]);

  return (
    <div className="flex flex-col gap-1 p-2">
      {purposeGroups.map((group) => (
        <PurposeSection
          key={group.label}
          group={group}
        />
      ))}
    </div>
  );
};
