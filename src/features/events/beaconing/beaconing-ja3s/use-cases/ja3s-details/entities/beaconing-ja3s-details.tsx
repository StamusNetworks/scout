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
import { BeaconingIPsTable } from '@/features/events/beaconing/beaconing-ips/molecules/beaconing-ips-table';
import { useBeaconReport } from '@/features/events/beaconing/common/hooks/use-beacon-report';
import { BeaconingMetadata } from '@/features/events/beaconing/common/molecules/beaconing-metadata';
import { ReportSummary } from '@/features/events/beaconing/common/molecules/report-summary';
import { formatBeaconMetric } from '@/features/events/beaconing/common/utils/format-beacon-metric';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { IpsServingJa3sTable } from '../molecules/ips-serving-ja3s-table';

interface BeaconingJa3sDetailsProps {
  ja3s: string;
}

export const BeaconingJa3sDetails = ({ ja3s }: BeaconingJa3sDetailsProps) => {
  const { reports, isLoading, isError } = useBeaconReport('ja3s', ja3s);

  if (isLoading) {
    return (
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Beaconing JA3S</PageTitle>
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
              <PageTitle>Beaconing JA3S</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          Error loading beaconing JA3S details.
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
              <PageTitle>Beaconing JA3S</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          No beaconing data found for this JA3S.
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
            <PageTitle>Beaconing JA3S</PageTitle>
          </PageHeaderContent>
        </PageHeader>
        <PageStats>
          <PageStat
            label="JA3S"
            value={
              <EventValue
                query_key="tls.ja3s.hash"
                value={ja3s}
              />
            }
          />
          <PageStat
            label="Score"
            value={
              <Badge variant="secondary">
                {formatBeaconMetric(report?.beacon_metric)}
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
        </PageStats>
        <Column>
          <CardTitle className="mb-3">Beacon</CardTitle>
          <ReportSummary
            value={ja3s}
            type="ja3s"
          />
        </Column>
        <Column>
          <CardTitle className="mb-3">Metadata</CardTitle>
          <ScrollArea
            className="overflow-auto pb-2"
            type="always"
          >
            <BeaconingMetadata
              value={ja3s}
              type="ja3s"
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Column>
        <Column>
          <CardTitle className="mb-3">IPs</CardTitle>
          <BeaconingIPsTable ips={report?.assets} />
        </Column>
        <Column>
          <CardTitle className="mb-3">IPs serving this JA3S</CardTitle>
          <IpsServingJa3sTable ja3s={ja3s} />
        </Column>
      </TogglePageContainer>
    </Page>
  );
};
