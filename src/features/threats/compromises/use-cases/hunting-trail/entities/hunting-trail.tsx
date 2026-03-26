import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';

import { useHuntingTrail } from '../hooks/use-hunting-trail';
import { AggregatedTimeline } from '../use-cases/aggregated-timeline';
import { FlowAggregated } from '../use-cases/flow-aggregated';
import { PurposeAggregated } from '../use-cases/purpose-aggregated';
import { QueryAggregated } from '../use-cases/query-aggregated';

interface HuntingTrailProps {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export const HuntingTrail = ({
  asset,
  startDate,
  endDate,
}: HuntingTrailProps) => {
  const { taggedEvents, isLoading, isError, isEmpty } = useHuntingTrail({
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

  return (
    <Tabs defaultValue="aggregated-timeline">
      <div className="px-2 pt-2">
        <TabsList>
          <TabsTrigger value="aggregated-timeline">
            Aggregated Timeline
          </TabsTrigger>
          <TabsTrigger value="query-aggregated">Query Aggregated</TabsTrigger>
          <TabsTrigger value="purpose-aggregated">
            Purpose Aggregated
          </TabsTrigger>
          <TabsTrigger value="flow-aggregated">Flow Aggregated</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="aggregated-timeline">
        <AggregatedTimeline events={taggedEvents} />
      </TabsContent>
      <TabsContent value="query-aggregated">
        <QueryAggregated events={taggedEvents} />
      </TabsContent>
      <TabsContent value="purpose-aggregated">
        <PurposeAggregated events={taggedEvents} />
      </TabsContent>
      <TabsContent value="flow-aggregated">
        <FlowAggregated events={taggedEvents} />
      </TabsContent>
    </Tabs>
  );
};
