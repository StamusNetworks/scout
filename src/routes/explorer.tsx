import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Explorer } from '@/pages/explorer';

export const Route = createFileRoute('/explorer')({
  component: () => (
    <PageBoundary key="explorer">
      <Explorer />
    </PageBoundary>
  ),
});
