import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { getFilterExtension } from '@/features/analytics/hosts/api/hooks/useHostsList';
import { useGetHostsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { DiscoveredHosts } from '@/features/analytics/hosts/components/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/analytics/hosts/components/home-net-picker/home-net-picker';
import {
  exportColumns,
  hitsColumn,
  hostsBaseColumns,
} from '@/features/analytics/hosts/components/hostsTable/hostsTable.columns';
import { HostsTable } from '@/features/analytics/hosts/components/hostsTable/hostsTable';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';

const hostsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().catch(true),
  in_home_net: z.enum(['true', 'false', 'all']).catch('all'),
});

type HostsSearch = z.output<typeof hostsSearchSchema>;

export const Route = createFileRoute('/_enterprise/hosts/')({
  validateSearch: (raw): HostsSearch => hostsSearchSchema.parse(raw),
  component: HostsRoute,
});

function HostsRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const QFBuilder = useQFBuilder();
  const globalParams = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    { extendQfilter: getFilterExtension(QFBuilder, search.in_home_net) },
  );

  const apiParams = {
    tenant: globalParams.tenant,
    start_date: globalParams.start_date,
    end_date: globalParams.end_date,
    host_id_qfilter: globalParams.host_id_qfilter,
    qfilter: search.with_alerts ? globalParams.qfilter : undefined,
    withAlerts: search.with_alerts,
    discovery: search.with_alerts ? globalParams.discovery : undefined,
    alert: search.with_alerts ? globalParams.alert : undefined,
    stamus: search.with_alerts ? globalParams.stamus : undefined,
  };

  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(search, apiParams, navigate);

  const { data, isFetching } = useGetHostsQuery({
    ...queryParams,
    ordering:
      queryParams.ordering ??
      (search.with_alerts ? '-hits' : '-host_id.last_seen'),
  });

  const columns = search.with_alerts
    ? [...hostsBaseColumns, hitsColumn]
    : hostsBaseColumns;

  const filteredExportColumns = exportColumns.filter((col) =>
    search.with_alerts ? true : col.label !== 'Hits',
  );

  return (
    <>
      <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
      <DefaultPage
        title="Hosts"
        actions={
          <HomeNetPicker
            value={search.in_home_net}
            onChange={(value) =>
              navigate({
                search: (prev) => ({ ...prev, in_home_net: value, page: 1 }),
              })
            }
          />
        }
        description="Gain deep visibility into network assets, enriched with live host indicators and actionable insights."
      >
        <DiscoveredHosts />
        <HostsTable
          data={data}
          isLoading={isFetching}
          columns={columns}
          exportColumns={filteredExportColumns}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          withAlerts={search.with_alerts}
          onWithAlertsChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, with_alerts: value, page: 1 }),
            })
          }
        />
      </DefaultPage>
    </>
  );
}
