import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { selectQueryFilters } from '@/features/filtering/filters/query-filters/query-filters.selectors';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useTestAvailableActionsQuery } from '../../api/filter-actions.api';
import { openDeclarationModal } from './create-edit-declaration-events/create-edit-declaration.slice';
import { openSuppressModal } from './create-edit-suppress-filter-action/create-edit-suppress.slice';
import { openTagModal } from './create-edit-tag-filter-action/create-edit-tag.slice';
import { openThresholdModal } from './create-edit-threshold-filter-filter-action/create-edit-threshold.slice';

export const FilterActionsDropdown = ({
  trigger,
}: {
  trigger: (disabled: boolean) => React.ReactNode;
}) => {
  const dispatch = useAppDispatch();

  const qfilter = useAppSelector(selectQueryFilters);
  const { data, isFetching } = useTestAvailableActionsQuery({
    fields: qfilter.map((f) => f.key),
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isFetching || data?.length === 0}
            asChild
          >
            <TooltipTrigger asChild>
              {trigger(isFetching || data?.length === 0)}
            </TooltipTrigger>
          </DropdownMenuTrigger>
          {/* onCloseAutoFocus is required to prevent focusing the trigger and displaying the tooltip */}
          <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem
              onClick={() => dispatch(openThresholdModal({ mode: 'create' }))}
              disabled={!data?.includes('threshold')}
            >
              Threshold
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => dispatch(openSuppressModal({ mode: 'create' }))}
              disabled={!data?.includes('suppress')}
            >
              Suppress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                dispatch(openTagModal({ mode: 'create', keep: false }))
              }
              disabled={!data?.includes('tag')}
            >
              Tag
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                dispatch(openTagModal({ mode: 'create', keep: true }))
              }
              disabled={!data?.includes('tagkeep')}
            >
              Tag and Keep
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => dispatch(openDeclarationModal({ mode: 'create' }))}
              disabled={!data?.includes('threat')}
            >
              Create declaration events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isFetching ||
          (data?.length === 0 && (
            <TooltipContent>
              You need a valid Filter Sets to create a filter action
            </TooltipContent>
          ))}
      </Tooltip>
    </TooltipProvider>
  );
};
