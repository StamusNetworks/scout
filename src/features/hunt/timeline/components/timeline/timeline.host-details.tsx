import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostStats } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { InternalExternal } from '@/features/analytics/hosts/components/internal-external';
import { IpOrEntityEventValue } from '@/features/hunt/entities/components/ip-or-entity';

import { useGetThreatHistoryQuery } from '../../api/timeline.api';
import { HostTimelineTemplate } from '../history-timeline/history-timeline';

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
          {host && <InternalExternal internal={host.host_id.in_home_net} />}
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
