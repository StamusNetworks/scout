import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Page } from '@/common/design-system/atoms/page';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { SignaturesTable } from '@/features/detection-methods/signatures/components/signatures-table/signatures-table';

export const Route = createFileRoute('/detection-methods/$detectionMethodId')({
  component: () => (
    <PageBoundary key="detection-method-by-id">
      <DetectionMethodDetailPage />
    </PageBoundary>
  ),
});

function DetectionMethodDetailPage() {
  return (
    <Page>
      <TogglePageContainer>
        <SignaturesTable />
      </TogglePageContainer>
    </Page>
  );
}
