import { createFileRoute } from '@tanstack/react-router';
import { FileWarning } from 'lucide-react';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageAlert,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { InvestigationHistoryList } from '@/features/investigation/entities/investigations-view';

export const Route = createFileRoute('/investigations')({
  component: () => (
    <PageBoundary key="investigations">
      <InvestigationsPage />
    </PageBoundary>
  ),
});

function InvestigationsPage() {
  usePageTitle('Investigations');
  return (
    <>
      <OutletBreadcrumb>Investigations</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageAlert
            Icon={FileWarning}
            title="Beta feature !"
            description="This feature is in beta and is subject to change. Investigations are stored in the browser's local storage."
            variant="default"
          />
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Investigations</PageTitle>
              <PageDescription>
                Investigations help you track and revisit your multi-step
                hunting processes. This page lets you review and analyze prior
                investigations--complete with results and initial context--to
                accelerate incident analysis and make threat hunting more
                structured and repeatable.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <InvestigationHistoryList />
        </TogglePageContainer>
      </Page>
    </>
  );
}
