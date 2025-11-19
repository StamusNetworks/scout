import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useTimeline } from '@/features/hunt/timeline/api/hooks/useTimeline';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { selectChartTarget } from '../store/dashboard.selectors';
import { setChartTarget } from '../store/dashboard.slice';

export const EventsCountTimeline = () => {
  const dispatch = useAppDispatch();
  const chartTarget = useAppSelector(selectChartTarget);
  const { data } = useTimeline(chartTarget);

  return (
    <Column>
      <Row className="mb-2 justify-end">
        <Tabs value={chartTarget.toString()}>
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
      {!data ? null : <BarChartTimeline data={data} />}
    </Column>
  );
};
