import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../../hooks/use-filter-action-modal';
import { CreateEditTagFilterActionForm } from './create-edit-tag.form';

export const CreateEditTagModal = () => {
  const { state, close } = useFilterActionModal();
  const tag = state.kind === 'tag' ? state : null;

  return (
    <Dialog
      open={!!tag}
      onOpenChange={(open) => !open && close()}
    >
      {tag && (
        <DialogContent>
          <DialogTitle>
            {tag.mode === 'create' ? 'Create Tag' : 'Edit Tag'}
            {tag.keep === true && ' and Keep'}
            {' filter action'}
          </DialogTitle>
          <DialogDescription>
            Create a Tag filter action to tag events matching the filters. The
            last applicable tag filter action will be applied. Tag and Keep will
            ignore the next applicable tag filter actions.
          </DialogDescription>
          <CreateEditTagFilterActionForm
            edit={tag.mode === 'edit'}
            keep={tag.keep}
            filterAction={tag.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
