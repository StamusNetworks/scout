import { esEscape } from '@/common/lib/strings';
import {
  HUNTING_TRAIL_DOCS_URL,
  PurposeAggregated,
  RunBanner,
  useHuntingTrail,
} from '@/features/hunting-trail';

interface CompromiseHuntingTrailProps {
  asset: string;
  from: number | undefined;
  to: number | undefined;
}

export const HuntingTrail = ({
  asset,
  from,
  to,
}: CompromiseHuntingTrailProps) => {
  const { groups, isLoading, isError, isEmpty, runStats, queryMetadata } =
    useHuntingTrail({
      from,
      to,
      additionalFilter: `(src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)})`,
    });

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
    <PurposeAggregated
      groups={groups}
      queryMetadata={queryMetadata}
    />
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
};
