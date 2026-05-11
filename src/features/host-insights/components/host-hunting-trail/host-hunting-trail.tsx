import {
  HUNTING_TRAIL_DOCS_URL,
  PurposeAggregated,
  RunBanner,
  useHostHuntingTrail,
} from '@/features/hunting-trail';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

export interface HostHuntingTrailProps {
  hostId: string;
}

export function HostHuntingTrail({ hostId }: HostHuntingTrailProps) {
  const { from, to } = useGlobalQueryParams(['dates']);
  const { groups, isLoading, isError, isEmpty, runStats } = useHostHuntingTrail(
    {
      asset: hostId,
      from,
      to,
    },
  );

  const body = isLoading ? (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-muted h-16 animate-pulse rounded-md"
        />
      ))}
    </div>
  ) : isError ? (
    <div className="text-destructive p-4 text-sm">
      Failed to load hunting trail data.
    </div>
  ) : isEmpty ? (
    <div className="text-muted-foreground p-4 text-sm">
      No hunting trail data found for this host.
    </div>
  ) : (
    <PurposeAggregated groups={groups} />
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <RunBanner
        total={runStats.total}
        withResults={runStats.withResults}
        docsUrl={HUNTING_TRAIL_DOCS_URL}
      />
      {body}
    </div>
  );
}
