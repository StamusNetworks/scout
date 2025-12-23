import { Column } from '@/common/design-system/atoms/layout/column';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostSummary } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { useGetImpactedEntitiesQuery } from '@/features/hunt/entities/api/entities.api';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { useGetEventsFromFlowQuery } from '../../api/events.api';
import { Event } from '../../model/event.schema';
import { getViewModel } from './meta-view.data-preparation';
import { EventDetails, HostsInfos } from './meta-view.header';
import { MetaViewTemplate } from './meta-view.timeline';

export const MetaView = ({ event }: { event: Event }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { enterprise } = useFeatureFlags();

  const { data: sourceHost } = useGetHostWithAlertsQuery({
    entity: event.flow?.src_ip || event.src_ip,
    tenant: params.tenant,
  });
  const { data: sourceEntitiesList } = useGetImpactedEntitiesQuery({
    asset: event.flow?.src_ip || event.src_ip,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const sourceEntity = sourceEntitiesList?.results?.[0];

  const { data: destinationHost } = useGetHostWithAlertsQuery({
    entity: event.flow?.dest_ip || event.dest_ip,
    tenant: params.tenant,
  });
  const { data: destinationEntitiesList } = useGetImpactedEntitiesQuery({
    asset: event.flow?.dest_ip || event.dest_ip,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const destinationEntity = destinationEntitiesList?.results?.[0];

  const { data: flowEvents } = useGetEventsFromFlowQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    qfilter: `flow_id:${event.flow_id}`,
  });

  console.log('ci');

  if (!flowEvents) return null;

  const source = enterprise ? (
    <HostSummary
      host={sourceHost}
      entity={sourceEntity}
    />
  ) : (
    <EventValue
      query_key={event.flow?.src_ip ? 'flow.src_ip' : 'src_ip'}
      value={event.flow?.src_ip || event.src_ip}
    />
  );
  const destination = enterprise ? (
    <HostSummary
      host={destinationHost}
      entity={destinationEntity}
    />
  ) : (
    <EventValue
      query_key={event.flow?.dest_ip ? 'flow.dest_ip' : 'dest_ip'}
      value={event.flow?.dest_ip || event.dest_ip}
    />
  );

  return (
    <Column>
      <EventDetails event={event} />
      <HostsInfos
        source={source}
        destination={destination}
      />
      <MetaViewTemplate
        viewModel={getViewModel(flowEvents)}
        event={event}
      />
    </Column>
  );
};
