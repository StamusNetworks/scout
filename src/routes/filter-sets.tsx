import { createFileRoute } from '@tanstack/react-router';
import { Group, Info, X } from 'lucide-react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageActions,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/common/design-system/atoms/ui/alert';
import { Button } from '@/common/design-system/atoms/ui/button';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { FilterSetsView } from '@/features/filter-sets/use-cases/list-filter-sets/filter-sets-view';
import { openSaveFilterSetModal } from '@/features/filter-sets/use-cases/save-filter-set/save-filterset.slice';
import { disableHelp } from '@/features/ui/help/help.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

export const Route = createFileRoute('/filter-sets')({
  component: () => (
    <PageBoundary key="filter-sets">
      <FilterSetsPage />
    </PageBoundary>
  ),
});

function FilterSetsPage() {
  usePageTitle('Filter Sets');
  const dispatch = useAppDispatch();
  const showFilterSetsBackNavTip = useAppSelector(
    (state) => state.help.showFilterSetsBackNavTip,
  );
  return (
    <>
      <OutletBreadcrumb>Filter Sets</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          {showFilterSetsBackNavTip && (
            <Alert className="mb-4">
              <Info />
              <AlertTitle>Pro tip</AlertTitle>
              <AlertDescription>
                After loading a Filter Set, use your browser&apos;s back button
                to come back to the Filter Sets page with preserved filters to
                cycle through the list effortlessly.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-2 right-2 size-7 pl-0!"
                onClick={() =>
                  dispatch(disableHelp('showFilterSetsBackNavTip'))
                }
              >
                <X />
              </Button>
            </Alert>
          )}
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Filter Sets</PageTitle>
              <PageDescription>
                Filter Sets help streamline your investigations by providing
                curated collections of filters, making it easier to rapidly
                trigger hunts or explore specific areas of your network.
                Effortlessly discover, manage, and create filter sets tailored
                to your investigation needs.
              </PageDescription>
            </PageHeaderContent>
            <PageActions>
              <Button onClick={() => dispatch(openSaveFilterSetModal())}>
                <Group />
                Create Filter Set
              </Button>
            </PageActions>
          </PageHeader>
          <FilterSetsView />
        </TogglePageContainer>
      </Page>
    </>
  );
}
