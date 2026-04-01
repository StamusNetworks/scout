import { createFileRoute } from '@tanstack/react-router';
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
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { FiltersActionsTable } from '@/features/filter-actions/components/filter-actions-table/filter-actions-table';
import { FilterActionsDropdown } from '@/features/filter-actions/components/filter-actions/filter-actions.dropdown';
import { UpdatePushRuleset } from '@/features/filter-actions/components/update-push-ruleset';

const filtersActionsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
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
                <UpdatePushRuleset />
                <FilterActionsDropdown
                  trigger={(disabled) => (
                    <Button
                      className="pointer-events-auto!"
                      variant="default"
                      disabled={disabled}
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
          <FiltersActionsTable />
        </TogglePageContainer>
      </Page>
    </>
  );
}
