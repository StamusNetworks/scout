import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { AttackSurfaceInventory } from '@/pages/attack-surface/inventory';

export const Route = createFileRoute('/_enterprise/attack-surface/inventory')({
  component: () => (
    <PageBoundary key="attack-surface-inventory">
      <AttackSurfaceInventory />
    </PageBoundary>
  ),
});
