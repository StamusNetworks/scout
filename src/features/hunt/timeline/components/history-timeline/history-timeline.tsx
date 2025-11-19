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
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { Host } from '@/features/analytics/hosts/model/host';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import {
  KillChainPhase,
  killChainsConfig,
} from '@/features/hunt/killchain/killchain';
import { ThreatTag } from '@/features/hunt/threats/components/threat-tag';
import { useThreat } from '@/features/hunt/threats/hooks/use-threat';

import { ThreatHistory } from '../../models/threat-history.model';
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

const TimelineJa4Item = ({ item }: { item: Ja4HistoryItem }) => {
  return (
    <Column>
      <p className="text-sm">New TLS Agent detected</p>
      <p className="mb-1 text-xs">
        <span className="font-bold">JA4 hash: </span>
        {item.hash}
      </p>
      {item.values?.map((value, i) => (
        <p
          key={i}
          className="text-xs"
        >
          <span className="font-bold">JA4 agent:</span> {value}
        </p>
      ))}
    </Column>
  );
};

const TimelineUserAgentItem = ({ item }: { item: UserAgentHistoryItem }) => {
  return (
    <Column>
      <p className="text-sm">New HTTP Agent detected</p>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineUsernameItem = ({ item }: { item: UsernameHistoryItem }) => {
  return (
    <Column>
      <p className="text-sm">New Username detected</p>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineHostnameItem = ({ item }: { item: HostnameHistoryItem }) => {
  return (
    <Column>
      <p className="text-sm">New Hostname detected</p>
      <p className="mb-1 text-xs">{item.value}</p>
    </Column>
  );
};

const TimelineServiceItem = ({ item }: { item: ServiceHistoryItem }) => {
  return (
    <Column>
      <p className="text-sm">New Service seen</p>
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
  const { data: threat, isLoading } = useThreat(
    parseInt(item.values.threat_id),
  );

  const formattedThreat = {
    threat__threat_id: parseInt(item.values.threat_id),
    threat__name: threat?.name || '',
    threat__family__family_id: threat?.family || 0,
    kill_chain:
      killChainsConfig[item.values.kc_step as KillChainPhase].kc_step || 0,
    kill_chain_offender: 0,
  };
  return (
    <Row className="items-center gap-2">
      {isLoading ? (
        <Spin className="h-4 w-4 animate-spin" />
      ) : (
        <ThreatTag threat={formattedThreat} />
      )}
      <span className="text-sm"> detected in phase </span>
      <KillchainTag kc={item.values.kc_step as KillChainPhase} />
    </Row>
  );
};
