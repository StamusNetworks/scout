import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { ExplorerView } from '@/features/events/components/explorer/explorer-view';

export const Route = createFileRoute('/explorer')({
  component: () => (
    <PageBoundary key="explorer">
      <ExplorerPage />
    </PageBoundary>
  ),
});

function ExplorerPage() {
  usePageTitle('Explorer');
  return (
    <>
      <OutletBreadcrumb>Explorer</OutletBreadcrumb>
      <Page>
        <TogglePageContainer className="space-y-4">
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Explorer</PageTitle>
              <PageDescription>
                Quickly understand and investigate event data through
                interactive panels and timelines, enabling deep exploration and
                agile threat hunting to support confident, informed security
                decisions.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <ExplorerView />
        </TogglePageContainer>
      </Page>
    </>
  );
}
