import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Events } from '@/pages/events';

export const Route = createFileRoute('/detection-events/')({
  component: () => (
    <PageBoundary key="events">
      <Events />
    </PageBoundary>
  ),
});
