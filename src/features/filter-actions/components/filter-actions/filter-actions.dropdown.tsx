import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { TooltipProvider } from '@/common/design-system/atoms/ui/tooltip';
import { TooltipMenuItem } from '@/common/design-system/molecules/tooltip-menu-item';
import { useQueryFilters } from '@/features/query-filters';
import { useAppDispatch } from '@/store/store';

import { useTestAvailableActionsQuery } from '../../api/filter-actions.api';
import { FilterActionKind } from '../../model/filter-action';
import { openDeclarationModal } from './create-edit-declaration-events/create-edit-declaration.slice';
import { openSendMailModal } from './create-edit-send-mail-filter-action/create-edit-send-mail.slice';
import { openSuppressModal } from './create-edit-suppress-filter-action/create-edit-suppress.slice';
import { openTagModal } from './create-edit-tag-filter-action/create-edit-tag.slice';
import { openThresholdModal } from './create-edit-threshold-filter-filter-action/create-edit-threshold.slice';

const LOADING_TOOLTIP = 'Available actions are loading';
const NO_DATA_TOOLTIP = 'You need a valid Filter Set to create a filter action';
const SMTP_TOOLTIP =
  'You need to configure the SMTP and enable the Output plugin in the Global Appliance Settings';

export const FilterActionsDropdown = ({
  trigger,
}: {
  trigger: () => React.ReactNode;
}) => {
  const dispatch = useAppDispatch();

  const qfilter = useQueryFilters();
  const { data, isFetching } = useTestAvailableActionsQuery({
    fields: qfilter.map((f) => f.key),
  });

  const noData = !isFetching && (data?.length ?? 0) === 0;

  const itemTooltip = (kind: FilterActionKind): string | undefined => {
    if (isFetching) return LOADING_TOOLTIP;
    if (noData) return NO_DATA_TOOLTIP;
    if (kind === 'sendMail' && !data?.includes('sendMail')) return SMTP_TOOLTIP;
    return undefined;
  };

  const itemDisabled = (kind: FilterActionKind): boolean =>
    isFetching || noData || !data?.includes(kind);

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger()}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <TooltipMenuItem
            disabled={itemDisabled('threshold')}
            tooltip={itemTooltip('threshold')}
            onClick={() => dispatch(openThresholdModal({ mode: 'create' }))}
          >
            Threshold
          </TooltipMenuItem>
          <TooltipMenuItem
            disabled={itemDisabled('suppress')}
            tooltip={itemTooltip('suppress')}
            onClick={() => dispatch(openSuppressModal({ mode: 'create' }))}
          >
            Suppress
          </TooltipMenuItem>
          <DropdownMenuSeparator />
          <TooltipMenuItem
            disabled={itemDisabled('tag')}
            tooltip={itemTooltip('tag')}
            onClick={() =>
              dispatch(openTagModal({ mode: 'create', keep: false }))
            }
          >
            Tag
          </TooltipMenuItem>
          <TooltipMenuItem
            disabled={itemDisabled('tagAndKeep')}
            tooltip={itemTooltip('tagAndKeep')}
            onClick={() =>
              dispatch(openTagModal({ mode: 'create', keep: true }))
            }
          >
            Tag and Keep
          </TooltipMenuItem>
          <DropdownMenuSeparator />
          <TooltipMenuItem
            disabled={itemDisabled('threat')}
            tooltip={itemTooltip('threat')}
            onClick={() => dispatch(openDeclarationModal({ mode: 'create' }))}
          >
            Create declaration events
          </TooltipMenuItem>
          <DropdownMenuSeparator />
          <TooltipMenuItem
            disabled={itemDisabled('sendMail')}
            tooltip={itemTooltip('sendMail')}
            onClick={() => dispatch(openSendMailModal({ mode: 'create' }))}
          >
            Send mail
          </TooltipMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};
