import { useMemo } from 'react';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetEventsFromFlowQuery } from '../../api/events.api';
import { Event } from '../../model/event.schema';
import { EventDetailData } from './event-detail-tabs.types';

export const useEventDetailData = (event: Event): EventDetailData => {
  const params = useGlobalQueryParams(['tenant']);

  const { data: flowEvents, isLoading: flowEventsLoading } =
    useGetEventsFromFlowQuery(
      {
        ...params,
        qfilter: `flow_id:${event.flow_id}`,
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
