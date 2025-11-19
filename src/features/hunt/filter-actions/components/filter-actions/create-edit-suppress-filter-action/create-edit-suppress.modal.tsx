import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { CreateEditSuppressFilterActionForm } from './create-edit-suppress.form';
import {
  closeSuppressModal,
  selectSuppressModal,
} from './create-edit-suppress.slice';

export const CreateEditSuppressModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, filterAction } = useAppSelector(selectSuppressModal);

  const handleOpenChange = (open: boolean) =>
    !open && dispatch(closeSuppressModal());
  const handleClose = () => dispatch(closeSuppressModal());
  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogTitle>
          {mode === 'create' ? 'Create ' : 'Edit '}Suppress filter action
        </DialogTitle>
        <DialogDescription>
          Create a Suppress filter action to suppress events matching the
          filters.
        </DialogDescription>
        <CreateEditSuppressFilterActionForm
          edit={mode === 'edit'}
          filterAction={filterAction}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
