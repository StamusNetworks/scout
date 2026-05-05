import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsFromFlowQuery } from '../api/events.api';
import { EventDetailData } from '../common/event-detail/event-detail-tabs.types';
import { Event } from '../model/event';

export const useEventDetailData = (event: Event): EventDetailData => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: flowEvents, isLoading: flowEventsLoading } =
    useGetEventsFromFlowQuery(
      {
        ...params,
        qfilter: `flow_id:${esEscape(String(event.flow_id))}`,
      },
      {
        skip: !event.flow_id,
      },
    );

  const files = useMemo(() => {
    if (
      !flowEventsLoading &&
      flowEvents?.Fileinfo &&
      flowEvents?.Fileinfo?.length > 0
    ) {
      return flowEvents.Fileinfo.filter((f) => f.fileinfo.stored === true).map(
        (f) => ({
          ...f.fileinfo,
          host: f.host || '',
        }),
      );
    }
    return [];
  }, [flowEvents, flowEventsLoading]);

  return { flowEvents, flowEventsLoading, files };
};
