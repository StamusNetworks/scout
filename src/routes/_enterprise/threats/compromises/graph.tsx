import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsGraphPage } from '@/pages/threats/graph';

export const Route = createFileRoute('/_enterprise/threats/compromises/graph')({
  component: () => (
    <PageBoundary key="threats-graph">
      <ThreatsGraphPage />
    </PageBoundary>
  ),
});
