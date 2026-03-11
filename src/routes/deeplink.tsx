import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Deeplink } from '@/pages/deeplink';

export const Route = createFileRoute('/deeplink')({
  component: () => (
    <PageBoundary key="deeplink">
      <Deeplink />
    </PageBoundary>
  ),
});
