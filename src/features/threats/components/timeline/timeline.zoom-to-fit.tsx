import { ScanSearch } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';

import { useTimelineContext } from './timeline';

interface TimelineZoomToFitProps {
  start_date: number;
  end_date: number;
}
export const TimelineZoomToFit = ({
  start_date,
  end_date,
}: TimelineZoomToFitProps) => {
  const { from_date, to_date, setFromDate, setToDate } = useTimelineContext();
  const handleZoomToFit = () => {
    setFromDate(start_date);
    setToDate(end_date);
  };
  return (
    <Button
      onClick={handleZoomToFit}
      variant="outline"
      disabled={start_date === from_date && end_date === to_date}
    >
      <ScanSearch />
      Zoom to fit
    </Button>
  );
};
