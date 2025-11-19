import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { DateTime } from '@/common/design-system/entities/date-time';
import { cn } from '@/common/lib/utils';
import { EntityThreatTagsListTemplate } from '@/features/hunt/entities/components/entities-threat-tags-list/entities-threat-tags-list';
import { Entity } from '@/features/hunt/entities/model/entity';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { KillChainPhase } from '@/features/hunt/killchain/killchain';

import { Host } from '../../model/host';
import { HostnameTemplate } from '../host-details/hostname';
import { NetworkTemplate } from '../host-details/network';
import { RolesTemplate } from '../host-details/roles';
import { UsernameTemplate } from '../host-details/username';

export const HostSummary = ({
  host,
  entity,
  hostId,
}: {
  host: Host | undefined;
  entity: Entity | undefined;
  hostId: string | undefined;
}) => (
  <Column>
    <Row className="mb-2 items-center gap-2">
      <EventValue
        value={hostId || host?.ip || ''}
        query_key="stamus.asset"
        className="text-xl font-bold"
      />
      {entity?.kill_chain && (
        <KillchainTag kc={entity?.kill_chain as KillChainPhase} />
      )}
    </Row>
    {entity && (
      <EntityThreatTagsListTemplate
        threats={entity.threats}
        maxThreats={4}
        className="mb-2 items-center"
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
