import { ExternalLink } from '@/common/design-system/atoms/external-link';
import { Country } from '@/common/design-system/atoms/flag';
import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Page,
  PageHeader,
  PageHeaderContent,
  PageStat,
  PageStats,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { CardTitle } from '@/common/design-system/atoms/ui/card';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { DateTime } from '@/common/design-system/entities/date-time';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
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
    return (
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Beaconing IP</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          Loading...
        </TogglePageContainer>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Beaconing IP</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          Error loading beaconing IP details.
        </TogglePageContainer>
      </Page>
    );
  }

  if (!reports?.length) {
    return (
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Beaconing IP</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          No beaconing data found for this IP.
        </TogglePageContainer>
      </Page>
    );
  }

  const report = reports[0];

  return (
    <Page>
      <TogglePageContainer className="space-y-8">
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Beaconing IP</PageTitle>
          </PageHeaderContent>
        </PageHeader>
        <PageStats>
          <PageStat
            label="Country"
            value={
              <Country
                code={report?.geoip_serving_ip?.country_code}
                country={report?.geoip_serving_ip?.ip_country || 'unknown'}
              />
            }
          />
          <PageStat
            label="IP"
            value={
              <EventValue
                query_key="ip"
                value={ip}
              />
            }
          />
          <PageStat
            label="Score"
            value={
              <Badge variant="secondary">
                {formatBeaconMetric(report?.beacon_metric || 0)}
              </Badge>
            }
          />
          <PageStat
            label="First seen"
            value={
              report?.first_seen ? (
                <DateTime date={report?.first_seen} />
              ) : (
                'n/a'
              )
            }
          />
          <PageStat
            label="Last seen"
            value={
              report?.last_seen ? <DateTime date={report?.last_seen} /> : 'n/a'
            }
          />
          <PageStat
            label="External link"
            value={
              <ExternalLink to={`http://virustotal.com/gui/ip-address/${ip}`}>
                VirusTotal
              </ExternalLink>
            }
          />
        </PageStats>
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
      </TogglePageContainer>
    </Page>
  );
};
