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
import { CoveragePage } from '@/features/threats/common/templates/coverage';

function ThreatsCoveragePage() {
  return (
    <Page>
      <OutletBreadcrumb>Coverage</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Coverage</PageTitle>
            <PageDescription>
              Review the coverage of threat detection methods and families in
              your environment.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <CoveragePage familyClass="doc" />
      </TogglePageContainer>
    </Page>
  );
}

export const Route = createFileRoute('/_enterprise/threats/coverage/')({
  component: () => (
    <PageBoundary key="threats-coverage">
      <ThreatsCoveragePage />
    </PageBoundary>
  ),
});
