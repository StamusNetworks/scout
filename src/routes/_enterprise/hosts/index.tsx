import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { useSearchNavigate } from '@/common/lib/use-search-navigate';
import { DiscoveredHosts } from '@/features/host-insights/common/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/host-insights/common/home-net-picker/home-net-picker';
import { HostsTable } from '@/features/host-insights/use-cases/hosts-list/entities/hosts-table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const searchSchema = z.object({
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).default(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().default(true),
  in_home_net: z.enum(['true', 'false', 'all']).default('all'),
});

export const Route = createFileRoute('/_enterprise/hosts/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="hosts">
      <HostsPage />
    </PageBoundary>
  ),
});

function HostsPage() {
  usePageTitle('Hosts');
  const search = Route.useSearch();
  const navigate = useSearchNavigate();
  const tanstackNavigate = useNavigate();

  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [globals.tenant, globals.start_date, globals.end_date],
      },
    );

  return (
    <>
      <OutletBreadcrumb link="/hosts">Hosts</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Hosts</PageTitle>
              <PageDescription>
                Gain deep visibility into network assets, enriched with live
                host indicators and actionable insights.
              </PageDescription>
            </PageHeaderContent>
            <HomeNetPicker
              value={search.in_home_net}
              onChange={(v) =>
                navigate({
                  search: (prev) => ({ ...prev, in_home_net: v, page: 1 }),
                })
              }
            />
          </PageHeader>
          <DiscoveredHosts inHomeNetwork={search.in_home_net} />
          <HostsTable
            page={page}
            pageSize={pageSize}
            sorting={sorting}
            withAlerts={search.with_alerts}
            inHomeNetwork={search.in_home_net}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortingChange={onSortingChange}
            onWithAlertsChange={(v) =>
              navigate({
                search: (prev) => ({ ...prev, with_alerts: v, page: 1 }),
              })
            }
            onRowClick={(hostId) =>
              tanstackNavigate({
                to: '/hosts/$hostId',
                params: { hostId },
              })
            }
          />
        </TogglePageContainer>
      </Page>
    </>
  );
}
