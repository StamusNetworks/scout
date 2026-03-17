import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { VolumetryPage } from '@/pages/volumetry';

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
