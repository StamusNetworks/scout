import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { HostnameTemplate } from '@/features/analytics/hosts/components/host-details/hostname';
import { NetworkTemplate } from '@/features/analytics/hosts/components/host-details/network';
import { UsernameTemplate } from '@/features/analytics/hosts/components/host-details/username';
import {
  getHostRole,
  Host,
  HostRoles,
} from '@/features/analytics/hosts/model/host';
import { EntityThreatTagsList } from '@/features/hunt/entities/components/entities-threat-tags-list/entities-threat-tags-list';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

export const beaconingIpsTableColumns: CustomColumnDef<Host>[] = [
  {
    id: 'ips',
    header: 'IPs',
    cell: ({ row }) => (
      <Column>
        <EventValue
          query_key="ip"
          value={row.original.ip}
        />
        <HostnameTemplate
          hostnames={row.original.host_id.hostname}
          size="small"
        />
      </Column>
    ),
  },
  {
    id: 'threats',
    header: 'Threats',
    cell: ({ row }) => (
      <EntityThreatTagsList
        entity={row.original.ip}
        className="max-w-60 flex-wrap"
        maxThreats={3}
      />
    ),
  },
  {
    id: 'network_info',
    header: 'Network info',
    cell: ({ row }) => (
      <Column>
        <NetworkTemplate networks={row.original.host_id.net_info} />
        <UsernameTemplate usernames={row.original.host_id.username} />
      </Column>
    ),
  },
  {
    id: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles = row.original.host_id.roles;
      return !roles?.length ? (
        <EventValue
          query_key="host_id.roles.name"
          value="unclassified"
        >
          <Badge variant="outline">{HostRoles.unclassified.label}</Badge>
        </EventValue>
      ) : (
        <Row className="gap-1">
          {roles?.map((role) => (
            <EventValue
              query_key="host_id.roles.name"
              value={role.name}
              key={role.name}
            >
              <Badge variant="outline">{getHostRole(role.name)}</Badge>
            </EventValue>
          ))}
        </Row>
      );
    },
  },
];
