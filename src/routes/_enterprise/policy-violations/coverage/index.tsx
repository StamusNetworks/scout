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

function PolicyViolationsCoveragePage() {
  return (
    <Page>
      <OutletBreadcrumb>Coverage</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Coverage</PageTitle>
            <PageDescription>
              Review the coverage of policy violation detection methods and
              families in your environment.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <CoveragePage kind="policyViolation" />
      </TogglePageContainer>
    </Page>
  );
}

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/',
)({
  component: () => (
    <PageBoundary key="pv-coverage">
      <PolicyViolationsCoveragePage />
    </PageBoundary>
  ),
});
