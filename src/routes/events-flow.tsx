import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { EventsFlowPage } from '@/pages/events-flow';

export const Route = createFileRoute('/events-flow')({
  component: () => (
    <PageBoundary key="events-flow">
      <EventsFlowPage />
    </PageBoundary>
  ),
});
