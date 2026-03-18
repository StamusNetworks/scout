import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useTimeline } from '@/features/threats/compromises/use-cases/timeline/api/hooks/useTimeline';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectChartTarget } from '../store/dashboard.selectors';
import { setChartTarget } from '../store/dashboard.slice';

export const EventsCountTimeline = () => {
  const dispatch = useAppDispatch();

  const chartTarget = useAppSelector(selectChartTarget);
  const { enterprise } = useFeatureFlags();
  const compChartTarget = enterprise ? chartTarget : false; // Chart target can only be specified in Enterprise

  const { data } = useTimeline(compChartTarget);

  return (
    <Column>
      {enterprise && (
        <Row className="mb-2 justify-end">
          <Tabs value={compChartTarget.toString()}>
            <TabsList>
              <TabsTrigger
                value="true"
                onClick={() => dispatch(setChartTarget(true))}
              >
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="false"
                onClick={() => dispatch(setChartTarget(false))}
              >
                Probes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      )}
      {!data ? null : <BarChartTimeline data={data} />}
    </Column>
  );
};
