import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsTimelineView } from '@/features/threats/compromises/use-cases/timeline/entities/threats-timeline-view';

export const Route = createFileRoute('/_enterprise/threats/timeline')({
  component: () => (
    <PageBoundary key="threats-timeline">
      <ThreatsTimelineView />
    </PageBoundary>
  ),
});
