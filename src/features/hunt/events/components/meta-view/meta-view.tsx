import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetEventsFromFlowQuery } from '../../api/events.api';
import { Event } from '../../model/event.schema';
import { getViewModel } from './meta-view.data-preparation';
import { MetaViewTemplate } from './meta-view.timeline';

export const MetaView = ({ event }: { event: Event }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: flowEvents } = useGetEventsFromFlowQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    qfilter: `flow_id:${event.flow_id}`,
  });

  if (!flowEvents) return null;

  return (
    <MetaViewTemplate
      viewModel={getViewModel(flowEvents)}
      event={event}
    />
  );
};
