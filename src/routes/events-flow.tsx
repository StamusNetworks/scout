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
import { EventsFlowView } from '@/features/events/use-cases/events-flow/entities/events-flow-view';

export const Route = createFileRoute('/events-flow')({
  component: () => (
    <PageBoundary key="events-flow">
      <EventsFlowPage />
    </PageBoundary>
  ),
});

function EventsFlowPage() {
  usePageTitle('Events Flow');

  return (
    <>
      <OutletBreadcrumb>Events Flow</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Events Flow</PageTitle>
              <PageDescription>
                Visualize event flows grouped by application protocol using
                Sankey charts, enabling deep exploration of network traffic
                patterns across all detection events.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <EventsFlowView />
        </TogglePageContainer>
      </Page>
    </>
  );
}
