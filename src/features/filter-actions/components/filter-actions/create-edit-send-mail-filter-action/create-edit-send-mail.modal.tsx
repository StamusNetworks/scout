import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { CreateEditSendMailFilterActionForm } from './create-edit-send-mail.form';
import {
  closeSendMailModal,
  selectSendMailModal,
} from './create-edit-send-mail.slice';

export const CreateEditSendMailModal = () => {
  const dispatch = useAppDispatch();
  const { isOpen, mode, filterAction } = useAppSelector(selectSendMailModal);

  const handleOpenChange = (open: boolean) =>
    !open && dispatch(closeSendMailModal());
  const handleClose = () => dispatch(closeSendMailModal());

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogTitle>
          {mode === 'create' ? 'Create ' : 'Edit '} Send mail filter action
        </DialogTitle>
        <DialogDescription>
          Send an email when events match the configured filters. Requires SMTP
          and the Output plugin to be configured in the Global Appliance
          Settings.
        </DialogDescription>
        <CreateEditSendMailFilterActionForm
          edit={mode === 'edit'}
          filterAction={filterAction}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
};
