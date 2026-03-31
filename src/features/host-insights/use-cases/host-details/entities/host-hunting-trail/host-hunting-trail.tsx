import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { PurposeAggregated } from '@/features/hunting-trail/molecules/purpose-aggregated';
import { useHostHuntingTrail } from '@/features/hunting-trail/use-cases/host-hunting-trail/use-host-hunting-trail';

export interface HostHuntingTrailProps {
  hostId: string;
}

export function HostHuntingTrail({ hostId }: HostHuntingTrailProps) {
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const { taggedEvents, isLoading, isError, isEmpty } = useHostHuntingTrail({
    asset: hostId,
    startDate: start_date,
    endDate: end_date,
  });

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        Failed to load hunting trail data.
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        No hunting trail data found for this host.
      </div>
    );
  }

  return <PurposeAggregated events={taggedEvents} />;
}
