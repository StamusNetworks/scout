import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Country } from '@/common/design-system/atoms/flag';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { CardTitle } from '@/common/design-system/atoms/ui/card';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { DateTime } from '@/common/design-system/entities/date-time';
import { useBeaconReport } from '@/features/events/beaconing/common/hooks/use-beacon-report';
import { BeaconingMetadata } from '@/features/events/beaconing/common/molecules/beaconing-metadata';
import { ReportSummary } from '@/features/events/beaconing/common/molecules/report-summary';
import { formatBeaconMetric } from '@/features/events/beaconing/common/utils/format-beacon-metric';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { BeaconingIPsTable } from '../../../molecules/beaconing-ips-table';

interface BeaconingIpDetailsProps {
  ip: string;
}

export const BeaconingIpDetails = ({ ip }: BeaconingIpDetailsProps) => {
  const { reports, isLoading, isError } = useBeaconReport('ip', ip);

  if (isLoading) {
    return <DefaultPage title="Beaconing IP">Loading...</DefaultPage>;
  }

  if (isError) {
    return (
      <DefaultPage title="Beaconing IP">
        Error loading beaconing IP details.
      </DefaultPage>
    );
  }

  if (!reports?.length) {
    return (
      <DefaultPage title="Beaconing IP">
        No beaconing data found for this IP.
      </DefaultPage>
    );
  }

  const report = reports[0];

  return (
    <DefaultPage
      title="Beaconing IP"
      className="space-y-8"
      stats={[
        {
          label: 'Country',
          value: (
            <Country
              code={report?.geoip_serving_ip?.country_code}
              country={report?.geoip_serving_ip?.ip_country || 'unknown'}
            />
          ),
        },
        {
          label: 'IP',
          value: (
            <EventValue
              query_key="ip"
              value={ip}
            />
          ),
        },
        {
          label: 'Score',
          value: (
            <Badge variant="secondary">
              {formatBeaconMetric(report?.beacon_metric || 0)}
            </Badge>
          ),
        },
        {
          label: 'First seen',
          value: report?.first_seen ? (
            <DateTime date={report?.first_seen} />
          ) : (
            'n/a'
          ),
        },
        {
          label: 'Last seen',
          value: report?.last_seen ? (
            <DateTime date={report?.last_seen} />
          ) : (
            'n/a'
          ),
        },
        {
          label: 'External link',
          value: (
            <ExternalLink to={`http://virustotal.com/gui/ip-address/${ip}`}>
              VirusTotal
            </ExternalLink>
          ),
        },
      ]}
    >
      <Column>
        <CardTitle className="mb-3">Beacon</CardTitle>
        <ReportSummary
          value={ip}
          type="ip"
        />
      </Column>
      <Column>
        <CardTitle className="mb-3">Metadata</CardTitle>
        <ScrollArea
          className="overflow-auto pb-2"
          type="always"
        >
          <BeaconingMetadata
            value={ip}
            type="ip"
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Column>
      <Column>
        <CardTitle className="mb-3">IPs</CardTitle>
        <BeaconingIPsTable ips={report?.assets} />
      </Column>
    </DefaultPage>
  );
};
