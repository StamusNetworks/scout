import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Deeplinks } from '@/pages/deeplinks';

export const Route = createFileRoute('/deeplinks')({
  component: () => (
    <PageBoundary key="deeplinks">
      <Deeplinks />
    </PageBoundary>
  ),
});
