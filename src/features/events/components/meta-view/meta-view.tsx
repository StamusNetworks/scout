import { esEscape } from '@/common/lib/strings';
import { Event } from '@/features/events/model/event';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsFromFlowQuery } from '../../api/events.api';
import { getViewModel } from './meta-view.data-preparation';
import { MetaViewTemplate } from './meta-view.timeline';

export const MetaView = ({ event }: { event: Event }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: flowEvents } = useGetEventsFromFlowQuery({
    tenant: params.tenant,
    from: params.from,
    to: params.to,
    qfilter: `flow_id:${esEscape(String(event.flow_id))}`,
  });

  if (!flowEvents) return null;

  return (
    <MetaViewTemplate
      viewModel={getViewModel(flowEvents)}
      event={event}
    />
  );
};
