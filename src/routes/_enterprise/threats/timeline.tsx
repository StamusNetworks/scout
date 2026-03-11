import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsTimelinePage } from '@/pages/threats/timeline';

export const Route = createFileRoute('/_enterprise/threats/timeline')({
  component: () => (
    <PageBoundary key="threats-timeline">
      <ThreatsTimelinePage />
    </PageBoundary>
  ),
});
