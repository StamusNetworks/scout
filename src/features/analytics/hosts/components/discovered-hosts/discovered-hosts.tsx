import { Grid } from '@/common/design-system/atoms/layout/grid';
import { StatsCardHorizontal } from '@/common/design-system/molecules/stats-card-horizontal';
import { addQueryFilter } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { AppDispatch, useAppDispatch } from '@/store/store';

import { useFetchHostsCounts } from '../../api/hooks/useHostsCounts';
import { useHomeNetParam } from '../home-net-picker/use-home-net-param';
import { indicators } from './discovered-hosts.config';

export const DiscoveredHosts = () => {
  const [inHomeNetwork] = useHomeNetParam();
  const { data, isFetching } = useFetchHostsCounts({ inHomeNetwork });
  const dispatch = useAppDispatch();
  return (
    <DiscoveredHostsTemplate
      hostsCounts={data}
      dispatch={dispatch}
      isFetching={isFetching}
    />
  );
};

export const DiscoveredHostsTemplate = ({
  hostsCounts,
  isFetching,
  dispatch,
}: {
  hostsCounts: Record<string, number> | undefined;
  isFetching: boolean;
  dispatch: AppDispatch;
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
        dispatch(
          addQueryFilter({ key: 'host_id.services_count.min', value: 1 }),
        )
      }
    />
    <StatsCardHorizontal
      {...indicators['domain-controllers']}
      value={hostsCounts?.domainControllersCount || 0}
      loading={isFetching}
      onClick={() =>
        dispatch(
          addQueryFilter({
            key: 'host_id.roles.name',
            value: 'domain controller',
          }),
        )
      }
    />
    <StatsCardHorizontal
      {...indicators['dhcp-servers']}
      value={hostsCounts?.dhcpServersCount || 0}
      loading={isFetching}
      onClick={() =>
        dispatch(addQueryFilter({ key: 'host_id.roles.name', value: 'dhcp' }))
      }
    />
    <StatsCardHorizontal
      {...indicators['http-proxies']}
      value={hostsCounts?.httpProxiesCount || 0}
      loading={isFetching}
      onClick={() =>
        dispatch(
          addQueryFilter({ key: 'host_id.roles.name', value: 'http proxy' }),
        )
      }
    />
    <StatsCardHorizontal
      {...indicators['printers']}
      value={hostsCounts?.printersCount || 0}
      loading={isFetching}
      onClick={() =>
        dispatch(
          addQueryFilter({ key: 'host_id.roles.name', value: 'printer' }),
        )
      }
    />
  </Grid>
);
