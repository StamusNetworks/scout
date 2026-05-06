import { createFileRoute } from '@tanstack/react-router';
import { Rocket } from 'lucide-react';

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
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { usePageTitle } from '@/common/lib/use-page-title';
import { TogglePageContainer } from '@/features/app-shell';
import { OperationalCenterView } from '@/features/operational-center';

export const Route = createFileRoute('/_enterprise/operational-center')({
  component: () => (
    <PageBoundary key="operational-center">
      <OperationalCenterPage />
    </PageBoundary>
  ),
});

function OperationalCenterPage() {
  usePageTitle('Operational Center');
  const { enterprise } = useFeatureFlags();

  return (
    <>
      <OutletBreadcrumb>Operational Center</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          {!enterprise && (
            <PageAlert
              Icon={Rocket}
              title="Enterprise feature"
              description="This page is using fake data in order to showcase the Enterprise feature"
              variant="primary"
            />
          )}
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Operational Center</PageTitle>
              <PageDescription>
                Get a unified, actionable view of your organization&apos;s
                security posture in real time. Use this dashboard as your main
                entry point for monitoring, investigation, and operational
                decision-making.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <OperationalCenterView enterprise={enterprise} />
        </TogglePageContainer>
      </Page>
    </>
  );
}
