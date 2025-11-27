import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { Flag } from '@/common/design-system/atoms/flag';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { Card } from '@/common/design-system/atoms/ui/card';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostSummary } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { useGetImpactedEntitiesQuery } from '@/features/hunt/entities/api/entities.api';

import { Event } from '../../model/event.schema';

export const MetaView = ({ event }: { event: Event }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data: sourceHost } = useGetHostWithAlertsQuery({
    entity: event.src_ip,
    tenant: params.tenant,
  });
  const { data: sourceEntitiesList } = useGetImpactedEntitiesQuery({
    asset: event.src_ip,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const sourceEntity = sourceEntitiesList?.results?.[0];

  const { data: destinationHost } = useGetHostWithAlertsQuery({
    entity: event.dest_ip,
    tenant: params.tenant,
  });
  const { data: destinationEntitiesList } = useGetImpactedEntitiesQuery({
    asset: event.dest_ip,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  const destinationEntity = destinationEntitiesList?.results?.[0];

  const timeline = [
    {
      side: 'left',
      content: (
        <Card className="flex flex-col gap-1 p-3">
          <h6>New service</h6>
          <p className="text-sm">
            <strong>Proto:</strong> TCP
          </p>
          <p className="text-sm">
            <strong>App Proto:</strong> HTTP
          </p>
          <p className="text-sm">
            <strong>Server:</strong> Apache/2.4.41 (Ubuntu)
          </p>
        </Card>
      ),
    },
    {
      side: 'right',
      content: (
        <Card className="flex flex-col gap-1 p-3">
          <h6>New tls agent</h6>
          <p className="text-sm">
            Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like
            Gecko
          </p>
          <p className="text-sm">t12d1909h2_d83cc789557e_7af1ed941c26</p>
        </Card>
      ),
    },
  ] satisfies {
    side: 'left' | 'right';
    content: React.ReactNode;
  }[];

  return (
    <Column>
      <Row className="mt-3 mb-4 gap-6">
        <StatsBlock
          label="Date"
          value={format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm')}
        />
        <StatsBlock
          label="Geoip"
          value={
            <Row className="items-center gap-1">
              <Flag code={event.geoip?.country?.iso_code} />
              {event.geoip?.country_name}
            </Row>
          }
        />
        <StatsBlock
          label="proto"
          value={event.proto}
        />
        <StatsBlock
          label="Interface"
          value={event.in_iface}
        />
      </Row>
      <Grid className="grid-cols-[1fr_min-content_1fr] gap-2">
        <Card className="p-4">
          Source IP
          <HostSummary
            host={sourceHost}
            entity={sourceEntity}
            hostId={event.flow?.src_ip || event.src_ip}
          />
        </Card>
        <div className="self-center">
          <ArrowRight />
        </div>
        <Card className="p-4">
          Destination IP
          <HostSummary
            host={destinationHost}
            entity={destinationEntity}
            hostId={event.flow?.dest_ip || event.dest_ip}
          />
        </Card>
      </Grid>
      <div className="mt-4">
        {timeline.map((item, i) => (
          <Grid
            className="grid-cols-[1fr_min-content_1fr] gap-5"
            key={i}
          >
            <div>{item.side === 'left' && item.content}</div>
            <div className="bg-foreground/10 h-full w-px" />
            <div>{item.side === 'right' && item.content}</div>
          </Grid>
        ))}
      </div>
    </Column>
  );
};
