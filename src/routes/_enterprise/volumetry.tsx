import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { usePageTitle } from '@/common/lib/use-page-title';
import { VolumetryView } from '@/features/events/components/volumetry-view/volumetry-view';

const seriesKeySchema = z.enum([
  'networkEvents',
  'flows',
  'alerts',
  'compromises',
  'policyViolations',
  'sightings',
  'outlierEvents',
]);

export const volumetrySearchSchema = z.object({
  scale: z.enum(['default', 'normalized', 'log']).catch('log'),
  series: z.array(seriesKeySchema).optional().catch(undefined),
  probe_search: z.string().optional().catch(undefined),
  probe_page: z.number().min(1).catch(1),
});

export type VolumetrySearch = z.output<typeof volumetrySearchSchema>;

export const Route = createFileRoute('/_enterprise/volumetry')({
  validateSearch: (raw): VolumetrySearch => volumetrySearchSchema.parse(raw),
  component: () => (
    <PageBoundary key="volumetry">
      <VolumetryPage />
    </PageBoundary>
  ),
});

function VolumetryPage() {
  usePageTitle('Volumetry');

  return (
    <>
      <OutletBreadcrumb>Volumetry</OutletBreadcrumb>
      <Page>
        <TogglePageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Volumetry</PageTitle>
              <PageDescription>
                Overview of network data volume, transactions, and detection
                events over the selected time period.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <VolumetryView />
        </TogglePageContainer>
      </Page>
    </>
  );
}
