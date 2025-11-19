import { format } from 'date-fns';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';

interface DateTwoLinesProps {
  date: Date;
}

export const DateTwoLines = ({ date }: DateTwoLinesProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1">
            <div className="text-xs">{format(date, 'yyyy-MM-dd')}</div>
            <div className="text-xs">{format(date, 'HH:mm:ss')}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{date.toString()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
