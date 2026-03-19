import { Workflow } from 'lucide-react';
import { useMemo } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGetProtocolsFromEventsQuery } from '@/features/events/common/events.api';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { buildEventsFlowQfilter } from '../build-events-flow-qfilter';
import { EventsFlowForProtocol } from '../molecules/events-flow-for-protocol';

export function EventsFlowView() {
  const globalParams = useGlobalQueryParams(['dates', 'qfilter', 'tenant']);

  const eventTypes = useMemo(
    () =>
      globalParams.alert !== undefined
        ? {
            alert: globalParams.alert,
            stamus: globalParams.stamus!,
            discovery: globalParams.discovery!,
          }
        : null,
    [globalParams.alert, globalParams.stamus, globalParams.discovery],
  );

  const protocolsQfilter = useMemo(
    () => buildEventsFlowQfilter(globalParams.qfilter, eventTypes),
    [globalParams.qfilter, eventTypes],
  );

  const { data: protocols, isLoading } = useGetProtocolsFromEventsQuery({
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    qfilter: protocolsQfilter,
    tenant: globalParams.tenant,
  });

  if (isLoading) {
    return <Spin />;
  }

  if (!protocols?.length) {
    return (
      <Empty className="border md:py-32">
        <EmptyMedia variant="icon">
          <Workflow />
        </EmptyMedia>
        <EmptyContent>
          <EmptyHeader>No events found</EmptyHeader>
          <EmptyDescription>
            Either there are no events or the filters are too restrictive.
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Column className="gap-6">
      {protocols.map((appProto) => (
        <EventsFlowForProtocol
          key={appProto}
          appProto={appProto}
          globalParams={globalParams}
          eventTypes={eventTypes}
        />
      ))}
    </Column>
  );
}
