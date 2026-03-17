import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { cn } from '@/common/lib/utils';

import type { Event } from '../../common/model/event.schema';

export const TAG_COLUMN: CustomColumnDef<Event> = {
  id: 'tag',
  header: () => null,
  cell: ({ row }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className={cn('size-2 rounded-full', {
              'bg-untagged': row.original.alert?.tag === undefined,
              'bg-informational': row.original.alert?.tag === 'informational',
              'bg-relevant': row.original.alert?.tag === 'relevant',
            })}
          />
        </TooltipTrigger>
        <TooltipContent>{row.original.alert?.tag || 'Untagged'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  meta: {
    canReorder: false,
  },
};
