import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OperationalCenter } from '@/pages/operational-center';

export const Route = createFileRoute('/_enterprise/operational-center')({
  component: () => (
    <PageBoundary key="operational-center">
      <OperationalCenter />
    </PageBoundary>
  ),
});
