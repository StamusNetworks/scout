import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { ExplorerView } from '@/features/hunt/dashboard/entities/explorer-view';

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
        <PageContainer className="space-y-4">
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
        </PageContainer>
      </Page>
    </>
  );
}
