import { last } from 'ramda';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { capitalizeAll } from '@/common/lib/strings';

import { getFilterDef } from '../constants/query-filter.definition';
import { EventValue } from './event-value/event-value';

interface EventFieldProps {
  filterId: string;
  value: string | number;
}

const getFallbackLabel = (filterId: string) => {
  const raw = last(filterId.split('.'));
  const withoutUnderscore = raw!.replace(/_/g, ' ');
  return capitalizeAll(withoutUnderscore);
};
export const EventField = ({ filterId, value }: EventFieldProps) => {
  const def = getFilterDef(filterId);
  const label = getFilterDef(filterId)?.label || getFallbackLabel(filterId);
  return (
    <Grid className="grid-cols-[135px_1fr] gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="text-left">{label}</TooltipTrigger>
          {def?.description && (
            <TooltipContent className="max-w-56">
              {def?.description || ''}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <div>
        {value && (
          <EventValue
            value={value?.toString()}
            query_key={filterId}
            className="line-clamp-3 text-wrap break-all"
          />
        )}
      </div>
    </Grid>
  );
};
