import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  type PurposeGroupData,
  type PurposeSlug,
} from '../../model/hunting-trail';
import {
  buildPurposeGroups,
  type PurposeGroup,
} from '../../model/purpose-grouping';
import { QueryCard } from '../query-card/query-card';

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
