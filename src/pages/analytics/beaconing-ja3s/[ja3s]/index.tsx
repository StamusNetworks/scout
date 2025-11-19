import { useParams } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { CardTitle } from '@/common/design-system/atoms/ui/card';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { DateTime } from '@/common/design-system/entities/date-time';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { IpsServingJa3sTable } from '@/features/analytics/beaconing/components/ips-serving-ja3s-table/ips-serving-ja3s-table';
import { BeaconingIPsTable } from '@/features/analytics/beaconing/components/ips-table/beaconing-ips-table';
import { BeaconingMetadata } from '@/features/analytics/beaconing/components/metadata/beaconing-metadata';
import { ReportSummary } from '@/features/analytics/beaconing/components/report-summary/report-summary';
import { useBeaconReport } from '@/features/analytics/beaconing/hooks/use-beacon-report';
import { formatBeaconMetric } from '@/features/analytics/beaconing/utils/format-beacon-metric';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

export const BeaconingJa3sDetails = () => {
  const { ja3s } = useParams();
  const { reports } = useBeaconReport('ja3s', ja3s!);
  return (
    <>
      <OutletBreadcrumb>{ja3s}</OutletBreadcrumb>
      <DefaultPage
        title="Beaconing JA3S"
        className="space-y-8"
        stats={[
          {
            label: 'JA3S',
            value: (
              <EventValue
                query_key="tls.ja3s.hash"
                value={ja3s!}
              />
            ),
          },
          {
            label: 'Score',
            value: (
              <Badge variant="secondary">
                {formatBeaconMetric(reports?.[0]?.beacon_metric)}
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
        ]}
      >
        <Column>
          <CardTitle className="mb-3">Beacon</CardTitle>
          <ReportSummary
            value={ja3s!}
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
              value={ja3s!}
              type="ja3s"
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Column>
        <Column>
          <CardTitle className="mb-3">IPs</CardTitle>
          <BeaconingIPsTable ips={reports?.[0]?.assets} />
        </Column>
        <Column>
          <CardTitle className="mb-3">IPs serving this JA3S</CardTitle>
          <IpsServingJa3sTable ja3s={ja3s!} />
        </Column>
      </DefaultPage>
    </>
  );
};
