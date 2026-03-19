import { Grid } from '@/common/design-system/atoms/layout/grid';
import { StatsCardHorizontal } from '@/common/design-system/molecules/stats-card-horizontal';
import { useCreateFilter } from '@/features/filtering/filters/query-filters/use-cases/create-filter/create-filter';
import { useFetchHostsCounts } from '@/features/host-insights/use-cases/hosts-list/hosts-list.api';

import { useHomeNetParam } from '../home-net-picker/use-home-net-param';
import { indicators } from './discovered-hosts.config';

export const DiscoveredHosts = () => {
  const [inHomeNetwork] = useHomeNetParam();
  const { data, isFetching } = useFetchHostsCounts({ inHomeNetwork });
  const createFilter = useCreateFilter();
  return (
    <DiscoveredHostsTemplate
      hostsCounts={data}
      createFilter={createFilter}
      isFetching={isFetching}
    />
  );
};

export const DiscoveredHostsTemplate = ({
  hostsCounts,
  isFetching,
  createFilter,
}: {
  hostsCounts: Record<string, number> | undefined;
  isFetching: boolean;
  createFilter: ReturnType<typeof useCreateFilter>;
}) => (
  <Grid className="mb-4 grid-cols-3 gap-2 2xl:grid-cols-6">
    <StatsCardHorizontal
      {...indicators['active-hosts']}
      value={hostsCounts?.activeHostsCount || 0}
      loading={isFetching}
    />
    <StatsCardHorizontal
      {...indicators['hosts-with-services']}
      value={hostsCounts?.hostsWithServicesCount || 0}
      loading={isFetching}
      onClick={() =>
        createFilter({ key: 'host_id.services_count.min', value: 1 })
      }
    />
    <StatsCardHorizontal
      {...indicators['domain-controllers']}
      value={hostsCounts?.domainControllersCount || 0}
      loading={isFetching}
      onClick={() =>
        createFilter({
          key: 'host_id.roles.name',
          value: 'domain controller',
        })
      }
    />
    <StatsCardHorizontal
      {...indicators['dhcp-servers']}
      value={hostsCounts?.dhcpServersCount || 0}
      loading={isFetching}
      onClick={() => createFilter({ key: 'host_id.roles.name', value: 'dhcp' })}
    />
    <StatsCardHorizontal
      {...indicators['http-proxies']}
      value={hostsCounts?.httpProxiesCount || 0}
      loading={isFetching}
      onClick={() =>
        createFilter({ key: 'host_id.roles.name', value: 'http proxy' })
      }
    />
    <StatsCardHorizontal
      {...indicators['printers']}
      value={hostsCounts?.printersCount || 0}
      loading={isFetching}
      onClick={() =>
        createFilter({ key: 'host_id.roles.name', value: 'printer' })
      }
    />
  </Grid>
);
