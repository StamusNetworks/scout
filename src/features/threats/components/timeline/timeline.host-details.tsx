import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import {
  HostStats,
  InternalExternal,
  useGetHostWithAlertsQuery,
} from '@/features/host-insights';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { IpOrEntityEventValue } from '@/features/threats/components/ip-or-entity/ip-or-entity';

import { useGetThreatHistoryQuery } from '../../api/timeline.api';
import { HostTimelineTemplate } from './history-timeline';

interface TimelineHostDetailsProps {
  entity: string;
}
export const TimelineHostDetails = ({ entity }: TimelineHostDetailsProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: host } = useGetHostWithAlertsQuery({
    entity: entity,
    tenant: params.tenant,
  });
  const { data: threatHistoryData } = useGetThreatHistoryQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    asset: entity,
  });

  return (
    <Column className="max-h-[80vh]">
      <Column className="px-6">
        <Row className="mb-2 items-center gap-2">
          {host?.host_id && (
            <InternalExternal internal={host.host_id.in_home_net} />
          )}
          <IpOrEntityEventValue
            entity={entity}
            offender={false}
            className="text-xl font-medium"
          />
        </Row>
        <HostStats
          host={host}
          className="mb-6 gap-y-2"
        />
      </Column>
      <ScrollArea
        className="overflow-auto border-t pr-4"
        type="hover"
      >
        <HostTimelineTemplate
          host_id={host?.host_id}
          threatHistory={threatHistoryData?.results[0]?.history}
        />
      </ScrollArea>
    </Column>
  );
};
