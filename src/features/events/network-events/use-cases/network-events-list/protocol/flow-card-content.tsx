import { HardDriveDownload, HardDriveUpload } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Label as UILabel } from '@/common/design-system/atoms/ui/label';
import { formatBytes, formatNumber } from '@/common/lib/numbers';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const FlowCardContent = ({ event }: { event: Event }) => (
  <Row className="items-center gap-4">
    <Column className="gap-2 truncate">
      <Grid className="grid grid-cols-[4rem_5rem_5rem] items-center gap-2">
        <UILabel className="w-16">Packets</UILabel>
        <Row className="gap-1">
          <HardDriveUpload />
          {formatNumber(event.flow?.pkts_toserver ?? 0)}
        </Row>
        <Row className="gap-1">
          <HardDriveDownload />
          {formatNumber(event.flow?.pkts_toclient ?? 0)}
        </Row>
      </Grid>
      <Grid className="grid grid-cols-[4rem_5rem_5rem] items-center gap-2">
        <UILabel>Bytes</UILabel>
        <Row className="gap-1">
          <HardDriveUpload />
          {formatBytes(event.flow?.bytes_toserver ?? 0)}
        </Row>
        <Row className="gap-1">
          <HardDriveDownload />
          {formatBytes(event.flow?.bytes_toclient ?? 0)}
        </Row>
      </Grid>
    </Column>
    <Column>
      <ProtocolLabel query_key="app_proto" />
      <EventValue
        query_key="app_proto"
        value={event.app_proto}
      />
    </Column>
    <Column>
      <ProtocolLabel query_key="proto" />
      <EventValue
        query_key="proto"
        value={event.proto}
      />
    </Column>
  </Row>
);
