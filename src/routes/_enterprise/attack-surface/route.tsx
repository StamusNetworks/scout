import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurface } from '@/pages/attack-surface';

export const Route = createFileRoute('/_enterprise/attack-surface')({
  component: () => (
    <PageBoundary key="attack-surface">
      <AttackSurface />
    </PageBoundary>
  ),
});
