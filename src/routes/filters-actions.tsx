import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ChevronDown, WandSparkles } from 'lucide-react';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Row } from '@/common/design-system/atoms/layout/row';
import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { Button } from '@/common/design-system/atoms/ui/button';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { UpdatePushRuleSet } from '@/features/rules';
import {
  FilterActionsDropdown,
  FiltersActionsTable,
} from '@/features/filter-actions';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const filtersActionsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
});

export type FiltersActionsSearch = z.output<typeof filtersActionsSearchSchema>;

export const Route = createFileRoute('/filters-actions')({
  validateSearch: (raw): FiltersActionsSearch =>
    filtersActionsSearchSchema.parse(raw),
  component: () => (
    <PageBoundary key="filters-actions">
      <FilterActionsPage />
    </PageBoundary>
  ),
});

function FilterActionsPage() {
  usePageTitle('Filter Actions');
  const search = Route.useSearch();
  const tanstackNavigate = useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  const globals = useGlobalQueryParams(['tenant']);
  const { page, pageSize, setPage, setPageSize } = usePaginatedSearch(
    { search, navigate },
    { resetOn: [globals.tenant] },
  );

  return (
    <>
      <OutletBreadcrumb>Filter Actions</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Filter Actions</PageTitle>
              <PageDescription>
                Manage how your system filters and transforms events, enabling
                you to tailor detection, reduce noise, and prioritize what
                matters most. Easily create automations controlling events
                suppression, escalation, and tagging.
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
              <Row className="items-center gap-2">
                <UpdatePushRuleSet />
                <FilterActionsDropdown
                  trigger={() => (
                    <Button
                      className="pointer-events-auto!"
                      variant="default"
                    >
                      <WandSparkles />
                      Create filter action
                      <ChevronDown size={14} />
                    </Button>
                  )}
                />
              </Row>
            </PageActions>
          </PageHeader>
          <FiltersActionsTable
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </TogglePageContainer>
      </Page>
    </>
  );
}
