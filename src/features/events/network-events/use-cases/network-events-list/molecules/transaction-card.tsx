import { useState } from 'react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { CardContent } from '@/common/design-system/atoms/ui/card';
import { DateTime } from '@/common/design-system/entities/date-time';
import { getDuration } from '@/common/lib/duration';
import {
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '@/features/events/common/event-detail';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Network } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { killChainsConfig } from '@/features/hunt/killchain/killchain';
import { ThreatTag } from '@/features/threats/common/molecules/threat-tag';
import { selectDefaultEventDetailTab } from '@/features/ui/preferences/preferences.slice';
import { useAppSelector } from '@/store/store';

import { AnomalyCardContent } from '../protocol/anomaly-card-content';
import { DnsCardContent } from '../protocol/dns-card-content';
import { FileinfoCardContent } from '../protocol/fileinfo-card-content';
import { FlowCardContent } from '../protocol/flow-card-content';
import { HttpCardContent } from '../protocol/http-card-content';
import { SmbCardContent } from '../protocol/smb-card-content';
import { TlsCardContent } from '../protocol/tls-card-content';

export const TransactionCard = ({ event }: { event: Event }) => {
  const [open, setOpen] = useState(false);
  return (
    <CardContent className="p-0">
      <Grid className="grid-cols-[1.25rem_2fr_min-content_3fr] items-center justify-between gap-4 text-sm">
        <Button
          variant="outline"
          onClick={() => setOpen(!open)}
          className="size-5 p-0"
        >
          {open ? '-' : '+'}
        </Button>
        <Column className="max-w-full truncate">
          <Row className="items-center gap-2">
            <p className="whitespace-nowrap">
              {event.event_type === 'flow' ? (
                <Row className="flex-wrap gap-1">
                  {event.flow?.start && <DateTime date={event.flow.start} />}
                  {'-'}
                  {event.flow?.end && <DateTime date={event.flow.end} />} {'('}
                  {event.flow?.start && event.flow?.end
                    ? getDuration(
                        new Date(event.flow.start),
                        new Date(event.flow.end),
                        {
                          precision: 3,
                        },
                      )
                    : 'Not finished'}
                  )
                </Row>
              ) : (
                <DateTime date={event.timestamp} />
              )}
            </p>
          </Row>
          <Grid className="grid-cols-[1fr_2rem_1fr] items-center gap-2">
            <Column className="gap-1 truncate">
              <EventValue
                query_key="src_ip"
                value={event.src_ip!}
              />
              <Hostname
                host={event.src_ip!}
                size="small"
              />
              <Network
                host={event.src_ip!}
                size="small"
              />
            </Column>
            <span>{'->'}</span>
            <Column className="gap-1 truncate">
              <EventValue
                query_key="dest_ip"
                value={event.dest_ip!}
              />
              <Hostname
                host={event.dest_ip!}
                size="small"
              />
              <Network
                host={event.dest_ip!}
                size="small"
              />
            </Column>
          </Grid>
        </Column>
        <EventValue
          query_key="event_type"
          value={event.event_type}
        />
        <ProtocolContent event={event} />
      </Grid>

      {open && (
        <div className="mt-4">
          <ExpandedRow event={event} />
        </div>
      )}
    </CardContent>
  );
};

const ProtocolContent = ({ event }: { event: Event }) => {
  switch (event.event_type) {
    case 'flow':
      return <FlowCardContent event={event} />;
    case 'http':
      return <HttpCardContent event={event} />;
    case 'tls':
      return <TlsCardContent event={event} />;
    case 'dns':
      return <DnsCardContent event={event} />;
    case 'smb':
      return <SmbCardContent event={event} />;
    case 'fileinfo':
      return <FileinfoCardContent event={event} />;
    case 'anomaly':
      return <AnomalyCardContent event={event} />;
    case 'alert':
      return (
        <Column>
          <EventValue
            query_key="alert.signature"
            value={event.alert?.signature}
          />
          <EventValue
            query_key="alert.category"
            value={event.alert?.category}
          />
        </Column>
      );
    case 'stamus':
      return (
        <Row className="gap-4">
          {event.stamus?.threat_id !== undefined && (
            <ThreatTag threat_id={event.stamus.threat_id} />
          )}
          {event.stamus?.kill_chain && (
            <KillchainTag
              kc={event.stamus.kill_chain as keyof typeof killChainsConfig}
            />
          )}
        </Row>
      );
    default:
      return <div></div>;
  }
};

const ExpandedRow = ({ event }: { event: Event }) => {
  const defaultTab = useAppSelector(selectDefaultEventDetailTab);
  return (
    <EventDetailTabs
      event={event}
      variant="pill"
      defaultTab={defaultTab}
    >
      <MetaViewTab event={event} />
      <SyntheticTab event={event} />
      <JsonTab event={event} />
      <RelatedEventsTabs />
      <PcapTab event={event} />
      <FilesTab />
    </EventDetailTabs>
  );
};
