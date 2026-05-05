import {
  ArrowUpDown,
  Edit2,
  EllipsisVertical,
  RefreshCcwDot,
  Trash2,
} from 'lucide-react';
import { isNil } from 'ramda';
import { useState } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/design-system/atoms/ui/dropdown-menu';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useReplaceFilters } from '@/features/query-filters/hooks/use-replace-filters';
import { useAppDispatch } from '@/store/store';

import { useGetFilterActionsQuery } from '../../api/filter-actions.api';
import {
  FILTER_ACTION_KIND_LABEL,
  FilterAction,
} from '../../model/filter-action';
import { openDeclarationModal } from '../filter-actions/create-edit-declaration-events/create-edit-declaration.slice';
import { openSuppressModal } from '../filter-actions/create-edit-suppress-filter-action/create-edit-suppress.slice';
import { openTagModal } from '../filter-actions/create-edit-tag-filter-action/create-edit-tag.slice';
import { openThresholdModal } from '../filter-actions/create-edit-threshold-filter-filter-action/create-edit-threshold.slice';
import { DeleteFilterActionForm } from './filter-actions-table.row-actions.delete-form';
import { MoveFilterActionForm } from './filter-actions-table.row-actions.move-form';

const iconSize = 12;
const dropdownItemClass = 'gap-2';

export const FilterActionRowActions = ({
  filterAction,
}: {
  filterAction: FilterAction;
}) => {
  const dispatch = useAppDispatch();
  const replaceFilters = useReplaceFilters();
  const { data, isLoading } = useGetFilterActionsQuery({});
  const [moveFilterActionModalOpen, setMoveFilterActionModalOpen] =
    useState(false);
  const [deleteFilterActionModalOpen, setDeleteFilterActionModalOpen] =
    useState(false);

  if (isLoading || isNil(data?.count)) return <Spin />;

  const lastIndex = data.count;

  const handleEditFilterAction = () => {
    switch (filterAction.kind) {
      case 'threshold':
        dispatch(openThresholdModal({ mode: 'edit', filterAction }));
        break;
      case 'threat':
        dispatch(openDeclarationModal({ mode: 'edit', filterAction }));
        break;
      case 'suppress':
        dispatch(openSuppressModal({ mode: 'edit', filterAction }));
        break;
      case 'tag':
        dispatch(openTagModal({ mode: 'edit', keep: false, filterAction }));
        break;
      case 'tagAndKeep':
        dispatch(openTagModal({ mode: 'edit', keep: true, filterAction }));
        break;
      default:
        break;
    }
  };

  const handleConvertToFilters = () => {
    replaceFilters(
      filterAction.filterDefs.map((filter) => ({
        key: filter.key,
        value: filter.value,
        options: {
          isNegated: filter.isNegated,
          isWildcarded: filter.isWildcarded,
        },
      })),
    );
  };

  const kindLabel = FILTER_ACTION_KIND_LABEL[filterAction.kind];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={dropdownItemClass}
              onClick={() => setMoveFilterActionModalOpen(true)}
            >
              <ArrowUpDown size={iconSize} /> Move filter action
            </DropdownMenuItem>
            <DropdownMenuItem
              className={dropdownItemClass}
              onClick={handleEditFilterAction}
            >
              <Edit2 size={iconSize} /> Edit filter action
            </DropdownMenuItem>
            <DropdownMenuItem
              className={dropdownItemClass}
              onClick={() => setDeleteFilterActionModalOpen(true)}
            >
              <Trash2 size={iconSize} /> Delete filter action
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={dropdownItemClass}
              onClick={handleConvertToFilters}
            >
              <RefreshCcwDot size={iconSize} /> Convert to filters
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={moveFilterActionModalOpen}
        onOpenChange={setMoveFilterActionModalOpen}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>
            Move {kindLabel} filter action at index {filterAction.index}
          </DialogTitle>
          <DialogDescription>
            Move a filter action by changing it&apos;s index. Be careful as the
            order might affect the way the filter action is applied.
          </DialogDescription>
          <MoveFilterActionForm
            filterAction={filterAction}
            lastIndex={lastIndex}
            handleClose={() => setMoveFilterActionModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteFilterActionModalOpen}
        onOpenChange={setDeleteFilterActionModalOpen}
      >
        <DialogContent>
          <DialogTitle>
            Delete {kindLabel} filter action at index {filterAction.index}
          </DialogTitle>
          <DialogDescription>
            Deleting a filter action will remove it from the list and cannot be
            undone. Content previously affected by this filter action will not
            be modified.
          </DialogDescription>
          <DeleteFilterActionForm
            filterAction={filterAction}
            handleClose={() => setDeleteFilterActionModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
