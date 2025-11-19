import { useNavigate } from 'react-router-dom';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { setDates } from '@/features/hunt/filtering/dates-filters/dates-filters.slice';
import {
  clearQueryFilters,
  updateTagFilters,
} from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

export const OutliersTimeline = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isFetching } = useGetCountsTimelineQuery({
    ...params,
    qfilter: `stamus_novel:true`,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });
  const handleBarClick = (bar: { time: number }) => {
    dispatch(clearQueryFilters());
    dispatch(
      updateTagFilters({
        novelty: true,
        alert: true,
        discovery: true,
        stamus: true,
        informational: true,
        relevant: true,
        untagged: true,
      }),
    );
    dispatch(
      setDates({
        type: 'range',
        start_date: bar.time,
        end_date: bar.time + (data?.interval || 0),
      }),
    );
    navigate(routes.explorer);
  };
  if (isFetching) return <div>Loading...</div>;
  if (!data) return null;
  return (
    <BarChartTimeline
      data={data}
      onBarClick={handleBarClick}
    />
  );
};
