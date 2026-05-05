import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { DateTime } from '@/common/design-system/entities/date-time';
import { cn } from '@/common/lib/utils';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { EntityThreatTagsListTemplate } from '@/features/threats';
import { KillchainTag } from '@/features/threats';
import { ImpactedEntity } from '@/features/threats';

import { Host } from '../model/host';
import { HostnameTemplate } from './host-attributes/hostname';
import { NetworkTemplate } from './host-attributes/network';
import { RolesTemplate } from './host-attributes/roles';
import { UsernameTemplate } from './host-attributes/username';
import { InternalExternal } from './internal-external';

export const HostSummary = ({
  host,
  entity,
  hostId,
}: {
  host: Host | undefined;
  entity: ImpactedEntity | undefined;
  hostId?: string | undefined;
}) => (
  <Column>
    <Row className="mb-2 items-center gap-2">
      {host?.host_id && (
        <InternalExternal internal={host.host_id.in_home_net} />
      )}
      <EventValue
        value={hostId || host?.ip || ''}
        query_key="ip"
        className="text-xl font-bold"
      />
      {entity?.phase && <KillchainTag kc={entity.phase} />}
    </Row>
    {entity && (
      <EntityThreatTagsListTemplate
        threats={entity.threats}
        maxThreats={4}
        className="mb-2 flex-wrap items-center"
      />
    )}
    <HostStats host={host} />
  </Column>
);

export const HostStats = ({
  host,
  className,
}: {
  host: Host | undefined;
  className?: string;
}) => (
  <Grid className={cn('mt-3 grid-cols-2 gap-x-12 gap-y-4', className)}>
    <StatsBlock
      label="Hostname"
      value={<HostnameTemplate hostnames={host?.host_id?.hostname} />}
    />
    <StatsBlock
      label="Role"
      value={<RolesTemplate roles={host?.host_id?.roles} />}
    />
    <StatsBlock
      label="Usernames"
      value={<UsernameTemplate usernames={host?.host_id?.username} />}
    />
    <StatsBlock
      label="Discovered date"
      value={
        host?.host_id?.first_seen && <DateTime date={host.host_id.first_seen} />
      }
    />
    <StatsBlock
      label="Network"
      value={
        host?.host_id?.net_info?.length ? (
          <NetworkTemplate networks={host?.host_id?.net_info} />
        ) : null
      }
    />
    <StatsBlock
      label="Last seen"
      value={
        host?.host_id?.last_seen && <DateTime date={host.host_id.last_seen} />
      }
    />
  </Grid>
);
