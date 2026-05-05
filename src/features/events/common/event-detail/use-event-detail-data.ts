import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { useGetEventsFromFlowQuery } from '@/features/events/common/events.api';
import { Event } from '@/features/events/common/events.model';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { EventDetailData } from './event-detail-tabs.types';

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
