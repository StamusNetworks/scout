import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurfaceVisualisation } from '@/pages/attack-surface/visualisation';

export const Route = createFileRoute('/_enterprise/attack-surface/')({
  component: () => (
    <PageBoundary key="attack-surface-visualisation">
      <AttackSurfaceVisualisation />
    </PageBoundary>
  ),
});
