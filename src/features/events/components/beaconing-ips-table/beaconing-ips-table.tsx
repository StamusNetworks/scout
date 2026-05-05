import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { esEscape } from '@/common/lib/strings';
import { useGetHostsQuery } from '@/features/host-insights/common/host-insights.api';
import {
  getHostRole,
  Host,
  HostRoles,
} from '@/features/host-insights/common/host.model';
import { HostnameTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { NetworkTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { UsernameTemplate } from '@/features/host-insights/use-cases/host-details/molecules/host-details/username';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { EntityThreatTagsList } from '@/features/threats/components/entities-threat-tags-list/entities-threat-tags-list';

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

interface BeaconingIpsTableProps {
  ips: string[] | undefined;
}

export const BeaconingIPsTable = ({ ips }: BeaconingIpsTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetHostsQuery(
    {
      ...params,
      ...pagination,
      host_id_qfilter: ips?.map((ip) => `ip:${esEscape(ip)}`).join(' OR '),
    },
    {
      skip: !ips,
    },
  );
  return (
    <DataTable
      data={data}
      columns={beaconingIpsTableColumns}
      isLoading={isFetching}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};
