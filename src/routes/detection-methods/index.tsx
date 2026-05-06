import { createFileRoute } from '@tanstack/react-router';
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
import { usePageTitle } from '@/common/lib/use-page-title';
import { TogglePageContainer } from '@/features/app-shell';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { RulesTable } from '@/features/rules';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-hits'),
  with_alerts: z.boolean().default(true),
});

export const Route = createFileRoute('/detection-methods/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary>
      <DetectionMethodsPage />
    </PageBoundary>
  ),
});

function DetectionMethodsPage() {
  usePageTitle('Detection Methods');
  const search = Route.useSearch();
  const tanstackNavigate = Route.useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  const globals = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [globals.tenant, globals.start_date, globals.end_date],
      },
    );

  return (
    <>
      <OutletBreadcrumb>Detection Methods</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Detection Methods</PageTitle>
              <PageDescription>
                Explore and investigate your detection logic in depth,
                understanding how network threats are identified, analyzed, and
                contextualized, to help you enhance detection capabilities and
                accelerate security investigations within your environment.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <RulesTable
            page={page}
            pageSize={pageSize}
            sorting={sorting}
            withAlerts={search.with_alerts}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortingChange={onSortingChange}
            onWithAlertsChange={(v) =>
              navigate({
                search: (prev) => ({ ...prev, with_alerts: v, page: 1 }),
              })
            }
          />
        </TogglePageContainer>
      </Page>
    </>
  );
}
