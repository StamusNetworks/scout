import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/design-system/atoms/ui/dialog';

import { useFilterActionModal } from '../../../hooks/use-filter-action-modal';
import { CreateEditSendMailFilterActionForm } from './create-edit-send-mail.form';

export const CreateEditSendMailModal = () => {
  const { state, close } = useFilterActionModal();
  const sendMail = state.kind === 'sendMail' ? state : null;

  return (
    <Dialog
      open={!!sendMail}
      onOpenChange={(open) => !open && close()}
    >
      {sendMail && (
        <DialogContent>
          <DialogTitle>
            {sendMail.mode === 'create' ? 'Create ' : 'Edit '} Send mail filter
            action
          </DialogTitle>
          <DialogDescription>
            Send an email when events match the configured filters. Requires
            SMTP and the Output plugin to be configured in the Global Appliance
            Settings.
          </DialogDescription>
          <CreateEditSendMailFilterActionForm
            edit={sendMail.mode === 'edit'}
            filterAction={sendMail.filterAction}
            onClose={close}
          />
        </DialogContent>
      )}
    </Dialog>
  );
};
