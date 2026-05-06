import { format } from 'date-fns';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { dateFromNow } from '@/common/lib/date-from-now';
import { useAppSelector } from '@/store/store';

import { selectTimeDisplay, TimeDisplay } from '../../state/preferences.slice';

export const DateTime = ({ date }: { date: Date | string | number }) => {
  const displayPreference = useAppSelector(selectTimeDisplay);
  const dateTime = new Date(date);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className="text-nowrap"
          onClick={(e) => e.stopPropagation()}
          asChild
        >
          <p className="w-fit cursor-text">
            {getDefaultDate(dateTime, displayPreference)}
          </p>
        </TooltipTrigger>
        <TooltipContent>
          <p className="mb-1">
            {format(dateTime, 'yyyy-MM-dd HH:mm:ss')} ({dateFromNow(dateTime)})
          </p>
          <Grid className="grid-cols-[min-content_1fr] gap-x-2">
            {displayPreference !== 'iso_8601' && (
              <>
                <b>ISO:</b>
                <span>{dateTime.toISOString()}</span>
              </>
            )}
            {displayPreference !== 'utc' && (
              <>
                <b>UTC:</b>
                <span>{dateTime.toUTCString()}</span>
              </>
            )}
            {displayPreference !== 'local' && (
              <>
                <b>Local:</b>
                <span>{dateTime.toLocaleString()}</span>
              </>
            )}
            <b>Unix:</b>
            <span>{dateTime.getTime()}</span>
          </Grid>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const getDefaultDate = (date: Date, preference: TimeDisplay) => {
  switch (preference) {
    case 'relative':
      return dateFromNow(date);
    case 'human_readable':
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    case 'iso_8601':
      return date.toISOString();
    case 'utc':
      return date.toUTCString();
    case 'local':
      return date.toLocaleString();
    default:
      return '';
  }
};
