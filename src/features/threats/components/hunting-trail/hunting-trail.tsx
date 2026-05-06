import { PurposeAggregated, useHostHuntingTrail } from '@/features/hunting-trail';

interface CompromiseHuntingTrailProps {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export const HuntingTrail = ({
  asset,
  startDate,
  endDate,
}: CompromiseHuntingTrailProps) => {
  const { groups, isLoading, isError, isEmpty } = useHostHuntingTrail({
    asset,
    startDate,
    endDate,
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

  return <PurposeAggregated groups={groups} />;
};
