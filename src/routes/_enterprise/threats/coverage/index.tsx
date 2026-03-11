import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsCoveragePage } from '@/pages/threats/coverage';

export const Route = createFileRoute('/_enterprise/threats/coverage/')({
  component: () => (
    <PageBoundary key="threats-coverage">
      <ThreatsCoveragePage />
    </PageBoundary>
  ),
});
