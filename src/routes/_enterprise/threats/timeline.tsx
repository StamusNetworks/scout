import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { Timeline } from '@/features/threats';

export const Route = createFileRoute('/_enterprise/threats/timeline')({
  component: () => (
    <PageBoundary key="threats-timeline">
      <ThreatsTimelinePage />
    </PageBoundary>
  ),
});

function ThreatsTimelinePage() {
  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Threats Timeline</PageTitle>
          </PageHeaderContent>
        </PageHeader>
        <Timeline />
      </TogglePageContainer>
    </Page>
  );
}
