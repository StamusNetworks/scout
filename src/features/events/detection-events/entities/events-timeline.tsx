import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { esEscape } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { useTimeline } from '@/features/hunt/timeline/api/hooks/useTimeline';

export interface EventsTimelineProps {
  hostId?: string;
}

export const EventsTimeline = ({ hostId }: EventsTimelineProps) => {
  const { enterprise } = useFeatureFlags();
  const [chartTarget, setChartTarget] = useState<boolean>(true);
  const compChartTarget = enterprise ? chartTarget : false;

  const QFBuilder = useQFBuilder();

  const extendQfilter = hostId
    ? [
        QFBuilder.createFilter(
          'es_filter',
          `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}")`,
        ),
      ]
    : undefined;

  const { data } = useTimeline(compChartTarget, { extendQfilter });

  return (
    <Column>
      {enterprise && (
        <Row className="mb-2 justify-end">
          <Tabs value={compChartTarget.toString()}>
            <TabsList>
              <TabsTrigger
                value="true"
                onClick={() => setChartTarget(true)}
              >
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="false"
                onClick={() => setChartTarget(false)}
              >
                Probes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      )}
      {!data ? null : (
        <BarChartTimeline
          data={data}
          className="h-[250px]"
        />
      )}
    </Column>
  );
};
