import { useMemo } from 'react';

import { type PurposeGroupData } from '../../model/hunting-trail';
import {
  groupEventsByType,
  type QueryMetadataMap,
} from '../../model/purpose-grouping';
import { QueryCard } from '../query-card/query-card';

export function PurposeTabContent({
  group,
  queryMetadata,
}: {
  group: PurposeGroupData;
  queryMetadata?: QueryMetadataMap;
}) {
  const queryGroups = useMemo(
    () => groupEventsByType(group.events, queryMetadata),
    [group.events, queryMetadata],
  );

  if (group.isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted h-16 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (group.isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        Failed to load data for this category.
      </div>
    );
  }

  if (queryGroups.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        No events found for this category in the selected time range.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {queryGroups.map((qg) => (
        <QueryCard
          key={qg.type}
          group={qg}
        />
      ))}
    </div>
  );
}
