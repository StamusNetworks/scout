import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

export const ThreatsTimelinePage = () => (
  <>
    <OutletBreadcrumb>Timeline</OutletBreadcrumb>
    <div className="mb-4" />
    <ThreatsTimeline />
  </>
);
