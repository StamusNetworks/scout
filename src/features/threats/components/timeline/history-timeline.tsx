import { format } from 'date-fns';
import {
  Biohazard,
  Clock,
  Globe,
  LaptopMinimal,
  Lock,
  User,
} from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/common/design-system/atoms/ui/popover';
import { Host } from '@/features/host-insights';
import { KillchainTag } from '@/features/threats/components/kill-chain-tag/kill-chain-tag';
import { ThreatTag } from '@/features/threats/components/threat-tag/threat-tag';
import { KillChainPhase } from '@/features/threats/model/kill-chain';

import { ThreatHistory } from '../../model/threat-history';
import {
  computeHistory,
  HistoryItem,
  HostnameHistoryItem,
  Ja4HistoryItem,
  ServiceHistoryItem,
  ThreatHistoryItem,
  UserAgentHistoryItem,
  UsernameHistoryItem,
} from './history-timeline.utils';

interface HostTimelineProps {
  host_id: Host['host_id'] | undefined;
  threatHistory: ThreatHistory['history'] | undefined;
}

export const HostTimelineTemplate = ({
  host_id,
  threatHistory,
}: HostTimelineProps) => {
  const history = computeHistory({ host_id, threatHistory });

  return (
    <Column className="mt-4">
      {history.map((item, index) => (
        <Grid
          key={index}
          className="grid-cols-[100px_min-content_1fr] gap-x-2"
        >
          <Column className="items-end pb-3">
            <p className="text-muted-foreground mb-1 text-xs">
              {format(new Date(item.timestamp), 'yyyy-MM-dd')}
            </p>
            <p className="text-muted-foreground mb-1 text-xs">
              {format(new Date(item.timestamp), 'HH:mm:ss')}
            </p>
          </Column>
          <div className="relative">
            <div className="bg-background relative z-10 rounded-full p-1">
              <TimelineIcon type={item.type} />
            </div>
            {index < history.length - 1 && (
              <div className="bg-border relative top-0 left-1/2 z-0 h-full w-px -translate-x-1/2" />
            )}
          </div>
          <div className="pb-3">
            <TimelineItem item={item} />
          </div>
        </Grid>
      ))}
    </Column>
  );
};

const TimelineIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'ja4':
      return <Lock />;
    case 'user_agent':
      return <Globe />;
    case 'threat':
      return <Biohazard />;
    case 'username':
      return <User />;
    case 'hostname':
      return <LaptopMinimal />;
    case 'service':
      return <Clock />;
    default:
      return <Clock />;
  }
};

const TimelineItem = ({ item }: { item: HistoryItem }) => {
  switch (item.type) {
    case 'ja4':
      return <TimelineJa4Item item={item} />;
    case 'user_agent':
      return <TimelineUserAgentItem item={item} />;
    case 'threat':
      return <TimelineThreatItem item={item} />;
    case 'username':
      return <TimelineUsernameItem item={item} />;
    case 'hostname':
      return <TimelineHostnameItem item={item} />;
    case 'service':
      return <TimelineServiceItem item={item} />;
    default:
      return <Clock />;
  }
};

const TimelineTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm [&+*]:mt-1">{children}</p>
);

const TimelineJa4Item = ({ item }: { item: Ja4HistoryItem }) => {
  const [first, ...rest] = item.values ?? [];
  return (
    <Column>
      <TimelineTitle>New TLS Agent detected</TimelineTitle>
      <p className="mb-1 text-xs">
        <span className="font-bold">JA4 hash: </span>
        {item.hash}
      </p>
      {first && (
        <p className="text-xs">
          <span className="font-bold">JA4 agent:</span> {first}
        </p>
      )}
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger className="text-muted-foreground mt-1 cursor-pointer self-start text-xs">
            View more ({rest.length})
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-fit max-w-128 space-y-1"
          >
            {rest.map((value, i) => (
              <p
                key={i}
                className="text-xs"
              >
                <span className="font-bold">JA4 agent:</span> {value}
              </p>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </Column>
  );
};

const TimelineUserAgentItem = ({ item }: { item: UserAgentHistoryItem }) => {
  return (
    <Column>
      <TimelineTitle>New HTTP Agent detected</TimelineTitle>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineUsernameItem = ({ item }: { item: UsernameHistoryItem }) => {
  return (
    <Column>
      <TimelineTitle>New Username detected</TimelineTitle>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineHostnameItem = ({ item }: { item: HostnameHistoryItem }) => {
  return (
    <Column>
      <TimelineTitle>New Hostname detected</TimelineTitle>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineServiceItem = ({ item }: { item: ServiceHistoryItem }) => {
  return (
    <Column>
      <TimelineTitle>New Service seen</TimelineTitle>
      <p className="mb-1 text-xs">
        <span className="font-bold">{item.app_proto} </span>
        on port{' '}
        <span className="font-bold">
          {' '}
          {item.proto}/{item.port}
        </span>
      </p>
    </Column>
  );
};

const TimelineThreatItem = ({ item }: { item: ThreatHistoryItem }) => {
  return (
    <Row className="items-center gap-2">
      <ThreatTag
        threat_id={parseInt(item.values.threat_id)}
        kill_chain={item.values.step}
      />
      <span className="text-sm"> detected in phase </span>
      <KillchainTag kc={item.values.step as KillChainPhase} />
    </Row>
  );
};
