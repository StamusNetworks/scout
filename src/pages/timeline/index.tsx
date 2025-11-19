import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

export const TimelinePage = () => {
  return (
    <DefaultPage
      title="Timeline"
      description="Explore the selected time period"
    >
      <ThreatsTimeline />
    </DefaultPage>
  );
};
