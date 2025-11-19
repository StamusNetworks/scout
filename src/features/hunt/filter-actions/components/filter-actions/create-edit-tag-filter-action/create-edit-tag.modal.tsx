import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { CreateEditTagFilterActionForm } from './create-edit-tag.form';
import { closeTagModal, selectTagModal } from './create-edit-tag.slice';

export const CreateEditTagModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, keep, filterAction } = useAppSelector(selectTagModal);

  const handleOpenChange = (open: boolean) =>
    !open && dispatch(closeTagModal());
  const handleClose = () => dispatch(closeTagModal());
  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogTitle>
          {mode === 'create' ? 'Create Tag' : 'Edit Tag'}
          {keep === true && ' and Keep'}
          {' filter action'}
        </DialogTitle>
        <DialogDescription>
          Create a Tag filter action to tag events matching the filters. The
          last applicable tag filter action will be applied. Tag and Keep will
          ignore the next applicable tag filter actions.
        </DialogDescription>
        <CreateEditTagFilterActionForm
          edit={mode === 'edit'}
          keep={keep}
          filterAction={filterAction}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
