import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { CreateEditDeclarationFilterActionForm } from './create-edit-declaration.form';
import {
  closeDeclarationModal,
  selectDeclarationModal,
} from './create-edit-declaration.slice';

export const CreateEditDeclarationModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, filterAction } = useAppSelector(selectDeclarationModal);

  const handleOpenChange = (open: boolean) =>
    !open && dispatch(closeDeclarationModal());

  const handleClose = () => dispatch(closeDeclarationModal());

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="max-w-2xl"
        aria-describedby={undefined}
      >
        <DialogTitle>
          {mode === 'create' ? 'Create declaration' : 'Edit declaration'}
        </DialogTitle>
        <CreateEditDeclarationFilterActionForm
          edit={mode === 'edit'}
          filterAction={filterAction}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
