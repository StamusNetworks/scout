import { useParams } from '@tanstack/react-router';

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
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { BeaconingIPsTable } from '@/features/analytics/beaconing/components/ips-table/beaconing-ips-table';
import { BeaconingMetadata } from '@/features/analytics/beaconing/components/metadata/beaconing-metadata';
import { ReportSummary } from '@/features/analytics/beaconing/components/report-summary/report-summary';
import { useBeaconReport } from '@/features/analytics/beaconing/hooks/use-beacon-report';
import { formatBeaconMetric } from '@/features/analytics/beaconing/utils/format-beacon-metric';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

export const BeaconingIpDetails = () => {
  const { ip } = useParams({ strict: false }) as { ip: string };
  const { reports } = useBeaconReport('ip', ip!);
  return (
    <>
      <OutletBreadcrumb>{ip}</OutletBreadcrumb>
      <DefaultPage
        title="Beaconing IP"
        className="space-y-8"
        stats={[
          {
            label: 'Country',
            value: (
              <Country
                code={reports?.[0]?.geoip_serving_ip?.country_code}
                country={
                  reports?.[0]?.geoip_serving_ip?.ip_country || 'unknown'
                }
              />
            ),
          },
          {
            label: 'IP',
            value: (
              <EventValue
                query_key="ip"
                value={ip!}
              />
            ),
          },
          {
            label: 'Score',
            value: (
              <Badge variant="secondary">
                {formatBeaconMetric(reports?.[0]?.beacon_metric || 0)}
              </Badge>
            ),
          },
          {
            label: 'First seen',
            value: reports?.[0]?.first_seen ? (
              <DateTime date={reports?.[0]?.first_seen} />
            ) : (
              'n/a'
            ),
          },
          {
            label: 'Last seen',
            value: reports?.[0]?.last_seen ? (
              <DateTime date={reports?.[0]?.last_seen} />
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
            value={ip!}
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
              value={ip!}
              type="ip"
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Column>
        <Column>
          <CardTitle className="mb-3">IPs</CardTitle>
          <BeaconingIPsTable ips={reports?.[0]?.assets} />
        </Column>
      </DefaultPage>
    </>
  );
};
